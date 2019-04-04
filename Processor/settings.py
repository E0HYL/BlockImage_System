# coding: utf-8
import os

from tornado.options import define, options, parse_command_line

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=True, help="run in debug mode")
define("address", default="127.0.0.1", help="run in the given address")

settings = {
    "cookie_secret": "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
    # "template_path": os.path.join(os.path.dirname(__file__), "templates"),
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
    # "login_url": "/login",
    "xsrf_cookies": False,
}