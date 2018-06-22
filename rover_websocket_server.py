import json
import os
import logging

import tornado.ioloop
import tornado.web
import tornado.websocket

try:
    import rrb3
except ImportError:
    print("WARNING: Unable to import rrb3")


# the global RRB3 instance
rover = None  # type: rrb3.RRB3


class RoverWebSocket(tornado.websocket.WebSocketHandler):
    def on_message(self, message):
        jm = json.loads(message)
        method = getattr(rover, jm['method'])
        retval = method(**jm['kwargs'])
        self.write_message(json.dumps(retval))



class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("/static/index.html")


def make_app():
    return tornado.web.Application([
        ("/", MainHandler),
        ("/roverws", RoverWebSocket)
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




def main():
    global rover

    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("--mockmode", action="store_true")

    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG)

    rover = create_rrb3(args.mockmode)

    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
