App = {
    web3Provider: null,
    blockimageInstance: null,
    authorityAccount: "0x49e8d63da357818194745119016020eccb262a1d",
    host: "ws://localhost:8888/WsHandler",
    startingBlock: 2211773,

    output: function(str) {
        var child = $('.container');
        var len = Math.ceil(str.length / 60) * 25;
        child.find('textarea').attr('style', 'height: ' + len + 'px;')
        child.find('textarea').text(str);
        var parent = $('.output');
        parent.append(child.html());
        // console.log('hh');
    },

    init: function() {
        // App.output('hh');
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(App.web3Provider);
        $.getJSON('BlockImage.json', function(data) {
            var contractABI = data.abi;
            var contractAddress = data.address;
            var blockimageContract = web3.eth.contract(contractABI);
            App.blockimageInstance = blockimageContract.at(contractAddress);
            web3.eth.getAccounts(function(error, accounts) {
                if (error || accounts[0] != App.authorityAccount) {
                    App.output("please connect to the authority account!", error);
                } else {
                    App.output("start working");
                    return App.socketWork();
                }
            });
        })
    },

    socketWork: function() {
        var socket = new WebSocket(App.host);
        // 调用合约方法
        socket.onmessage = function(msg) {
            var recv = JSON.parse(msg.data);
            App.output("Instruction:" + JSON.stringify(recv));
            var func = recv.function;
            if (func == "confirm") {
                App.blockConfirm(recv.account, recv.hash);
            } else if (func == "publish") {
                // App.output(recv.imgindex);
                App.blockPublish(recv.imgindex, recv.oHash, recv.eHash, recv.wHash, recv.key, recv.pro);
            } else if (func == "sendKey") {
                App.blockSendKey(recv.owner, recv.userkey);
            }
        };
        // 监听密钥请求
        var logkRequest = App.blockimageInstance.LogkRequest({ fromBlock: App.startingBlock });
        logkRequest.watch(function(err, res) {
            if (!err) {
                // App.output("received key request" + JSON.stringify(res));
                var data = res.args;
                var reqlist = [data.owner, data.publicKey, data.key];
                // var jsonText = JSON.stringify(reqlist);
                App.output("Received key request" + JSON.stringify(reqlist));
                socket.send(reqlist);
            }
        });
    },

    blockConfirm: function(addr, infoHash) {
        App.output("Confirm:" + addr + infoHash);
        App.blockimageInstance.confirm(addr, infoHash, function(err, res) {
            App.output("txindex:" + JSON.stringify(res));
        });
    },

    blockPublish: function(index, oHash, eHash, wHash, key, pro) {
        // 先读oHash，不一致时pro置false
        // App.output(index);
        App.blockimageInstance.images(index, function(err, res) {
            // App.output(JSON.stringify(res));
            var c_oHash = res[1];
            // App.output(c_oHash);
            // App.output(oHash);
            if (c_oHash != oHash) pro = false;
            if (pro) {
                App.output("Publish: true");
                App.blockimageInstance.publish(index, oHash, eHash, wHash, key, true, function(err, res) {
                    App.output("txindex:" + JSON.stringify(res));
                });
            } else {
                App.output("Publish: false");
                App.blockimageInstance.publish(index, "", "", "", "", false, function(err, res) {
                    App.output("txindex:" + JSON.stringify(res));
                });
            }
        });
    },

    blockSendKey: function(owner, userkey) {
        App.output("Send key:" + owner + userkey);
        App.blockimageInstance.sendKey(owner, userkey, function(err, res) {
            App.output("txindex:" + JSON.stringify(res));
        });
    }
};

$(function() {
    App.init();
});