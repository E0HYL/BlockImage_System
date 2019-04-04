# coding: utf-8
import tornado.ioloop
import os
from tornado.options import options, parse_command_line
from urls import app

basePath = os.path.dirname(os.path.dirname(__file__))


if __name__ == "__main__":
    # print(os.name)
    application = app()
    parse_command_line()
    application.listen(options.port)
    tornado.ioloop.IOLoop.current().start()
