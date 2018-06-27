import json

import concurrent.futures

import tornado.concurrent
from tornado.ioloop import IOLoop
from tornado.queues import Queue
import tornado.web
import tornado.websocket
import tornado.gen


counter = 0

executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
queues = []


@tornado.gen.coroutine
def foo():
    global counter
    future = IOLoop.current().run_in_executor(executor, foobody)
    retval = yield future
    for q in queues:
        yield q.put(retval)
    counter += 1


def foobody():
    return 42


callback = tornado.ioloop.PeriodicCallback(foo, 1000)


class FirehoseWebSocket(tornado.websocket.WebSocketHandler):
    @tornado.gen.coroutine
    def open(self):
        print "hose open"
        global queues
        self.queue = Queue()
        queues.append(self.queue)
        while True:
            item = yield self.queue.get()
            self.queue.task_done()
            self.write_message(json.dumps(item))

    @tornado.gen.coroutine
    def on_close(self):
        global queues
        yield self.queue.join()
        queues.remove(self.queue)

import os

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("/static/index.html")



def make_app():
    return tornado.web.Application([
        ("/", MainHandler),
        ("/firehose", FirehoseWebSocket),
    ], static_path=os.path.join(os.path.dirname(__file__), 'static'))


def main():
    callback.start()
    app = make_app()
    app.listen(8888)
    IOLoop.current().start()


if __name__ == "__main__":
    main()