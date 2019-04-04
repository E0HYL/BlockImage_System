# coding: utf-8

import tornado.web
from tornado import httpserver

from settings import settings
from settings import BASE_DIR
from views import UploadJobHandler, SendContact, FinishUpload, WsHandler
import os

def app():
    application = tornado.web.Application([
        (r"/uploadfile", UploadJobHandler),
        (r"/sendcontact", SendContact),
        (r"/finishupload", FinishUpload),
        (r"/WsHandler", WsHandler),

    ], **settings)
    # server = httpserver.HTTPServer(application, ssl_options={
    #     "certfile": os.path.join(BASE_DIR, "file_upload-master/static/server.crt"),
    #     "keyfile": os.path.join(BASE_DIR, "file_upload-master/static/server.key"),
    # })
    return application