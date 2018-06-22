import code
import json

from tornado.ioloop import IOLoop, PeriodicCallback
from tornado import gen
from tornado.websocket import websocket_connect, WebSocketClientConnection


class WSRover(object):
    def __init__(self, url, ioloop):
        # type: (str, IOLoop) -> object
        self.url = url
        self.ioloop = ioloop

    @gen.coroutine
    def connect(self):
        self.ws = yield websocket_connect(self.url)


def _main():
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("url")

    args = parser.parse_args()

    ioloop = IOLoop.instance()
    ioloop.start()
    wsrover = WSRover(args.url, ioloop)
    code.interact("Welcome to rover control!", local={'wsrover': wsrover})

def main():
    ioloop = IOLoop.instance()
    print(ioloop)
    ioloop.run_sync(async_main)
    #ioloop.add_callback()


def message_received(m):
    print "Message received", m

@gen.coroutine
def async_main():
    print "doing stuff"
    wsconn = yield websocket_connect("ws://localhost:8888/roverws", on_message_callback=message_received)  # type: WebSocketClientConnection
    wsconn.write_message(json.dumps({
        "method": "set_driver_pins",
        "kwargs": {"left_pwm": 123, "left_dir": 456, "right_pwm": 987, "right_dir": 555}
    }))
    print(wsconn)

if __name__ == "__main__":
    main()