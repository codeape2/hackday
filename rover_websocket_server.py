import json
import os
import logging
import concurrent.futures
import traceback

import tornado.concurrent
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.gen

try:
    from mpu6050 import mpu6050
except ImportError:
    print("WARNING: Unable to import mpu6050")

try:
    import rrb3
except ImportError:
    print("WARNING: Unable to import rrb3")


# the global RRB3 instance
rover = None  # type: rrb3.RRB3
sensor = None # type: mpu6050


FIREHOSE_INTERVAL = 200
RANGEFINDER_INTERVAL = 200


class RoverWebSocket(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def on_message(self, message):
        try:
            jm = json.loads(message)
            method = getattr(rover, jm['method'])
            retval = method(**jm['kwargs'])
            self.write_message(json.dumps(retval))
        except:
            logging.exception("Exception executing rover method")
            self.write_message(json.dumps({"error": traceback.format_exc()}))


class RangeFinderWebSocket(tornado.websocket.WebSocketHandler):
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
    def open(self):
        self.callback = tornado.ioloop.PeriodicCallback(self.send_rangefinderdata, RANGEFINDER_INTERVAL)
        self.callback.start()

    @tornado.gen.coroutine
    def send_rangefinderdata(self):
        distance = yield self.get_distance()
        self.write_message(json.dumps(distance))

    @tornado.concurrent.run_on_executor
    def get_distance(self):
        return rover.get_distance()

    def on_close(self):
        logging.debug("Closing /rangefinder ws")
        self.callback.stop()


class FirehoseWebSocket(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        self.callback = tornado.ioloop.PeriodicCallback(self.send_gyrodata, FIREHOSE_INTERVAL)
        self.callback.start()

    def send_gyrodata(self):
        self.write_message(json.dumps({
            "gyro": sensor.get_gyro_data(),
            "accel": sensor.get_accel_data(),
            "temp": sensor.get_temp()
        }))

    def on_close(self):
        logging.debug("Closing /firehose ws")
        self.callback.stop()


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("/static/index.html")


def make_app():
    return tornado.web.Application([
        ("/", MainHandler),
        ("/roverws", RoverWebSocket),
        ("/firehose", FirehoseWebSocket),
        ("/rangefinder", RangeFinderWebSocket)
    ], static_path=os.path.join(os.path.dirname(__file__), 'static'))


def create_rrb3(mockmode):
    # type: (bool) -> rrb3.RRB3
    if not mockmode:
        logging.info("Initializing RRB3")
        import rrb3
        return rrb3.RRB3()
    else:
        logging.info("Using mock RRB3")
        import mock_rrb3
        return mock_rrb3.MockRRB3()


def create_sensor(mockmode):
    if not mockmode:
        from mpu6050 import mpu6050
        return mpu6050(0x68)
    else:
        from mock_mpu6050 import MockMPU6050
        return MockMPU6050()



def main():
    global rover
    global sensor

    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("--mockmode", action="store_true")

    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG)

    rover = create_rrb3(args.mockmode)
    sensor = create_sensor(args.mockmode)

    logging.info("Starting app on port 8888")
    app = make_app()
    app.listen(8888)
    logging.info("Starting io loop, running on http://localhost:8888/")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
