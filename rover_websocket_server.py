import json
import os

import tornado.ioloop
import tornado.web
import tornado.websocket


class RoverWebSocket(tornado.websocket.WebSocketHandler):
    def on_message(self, message):
        print("MESSAGE:", json.loads(message))


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("/static/index.html")


def make_app():
    return tornado.web.Application([
        ("/", MainHandler),
        ("/roverws", RoverWebSocket)
    ], static_path=os.path.join(os.path.dirname(__file__), 'static'))


if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()