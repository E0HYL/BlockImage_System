App = {
  web3Provider: null,
  blockimageInstance: null,
  latestBlock: null,

  account: null,
  authentication: null,
  userPublish: null,
  userBought: null,
  userData: [0, 0, 0, 0],
  dataContainer: $('.singleinf'),

  keycount: 0,
  imagepage: 1,
  imagelist: null,
  startingBlock: 2296367,
  processorIP: "http://10.204.14.181:8888/",

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    return App.loadContract();
  },

  loadContract: function() {
    $.getJSON('BlockImage.json', function(data) {
      var contractABI = data.abi;
      var contractAddress = data.address;
      var blockimageContract = web3.eth.contract(contractABI);
      App.blockimageInstance = blockimageContract.at(contractAddress);
      return App.getAccount();
    })
    return App.loadBlocks();
  },

  getAccount: function() {
    // 获取用户账号
    web3.eth.getAccounts(function(error, accounts) {
      if (error || !accounts || accounts.length == 0) {
        Pop("解锁一个以太坊账户才能浏览图库哦~", { Animation: 'showSweetAlert' });
      }else{
        App.account = accounts[0];
        // 最新图片
        App.blockimageInstance.getCheckedImages(function(err, res) {
          console.log("gallery imgs",res);
          App.imagelist = res;
          App.loadImages();
          App.bindPageChange();
        });
        App.bindSearch();
        App.bindVerify();
        return App.getAuthen();
      }
    });
  },

  getAuthen: function() {
    // 检查认证
    App.blockimageInstance.getAuthentication(App.account, function(err, res) {
      console.log(res);
      if(res){
        console.log("already authenticated:)");
        App.authentication = 1;
        var child = $('.changesingle');
        child.find('a').attr('onclick', 'singleonclick()');
        App.bindUpload();
        App.bindAuthen();
        return App.userInit();
      } else {
        // 页面：请先认证 [button: look around first -> gallery]
        console.log("get yourself authenticated first!");
        Pop("您可以先逛逛图库，但要实现更多交易功能请先认证哦~", { Animation: 'showSweetAlert' });
        App.bindSubmit();
      }   
    });
  },

  userInit: function() {
    // 获取用户信息
    App.blockimageInstance.users(App.account, function(err, res) {
      App.viewInfo(res);
    });

    // 获取已发布&已购的作品
    App.blockimageInstance.getUserImages(App.account, function(err, res) {
      App.userPublish = res[0];
      App.userBought = res[1];
      App.userData[2] = App.userPublish.length;
      App.userData[3] = App.userBought.length;
      App.dataContainer.find('.nwork').text(App.userData[2]);
      App.dataContainer.find('.nbuy').text(App.userData[3]);
      console.log("user published",res[0]);
      console.log("user bought",res[1]);

      if (App.userPublish) {
        for(i = 0; i < App.userPublish.length; i++){
          // BigNumber
          var index = App.userPublish[i].c[0];
          App.blockimageInstance.images(index, function(err,res) {
            App.viewWork(res);
          })
        }
      }
      if (App.userBought) { 
        for(i = 0; i < App.userBought.length; i++){
          var index = App.userBought[i].c[0];
          App.blockimageInstance.images(index, function(err,res) {
            App.viewBought(res);
          })
        }
      }
    })
    
    // 监听发出的交易请求[shopping]
    var LogtRequest = App.blockimageInstance.LogtRequest({buyer:App.account}, {fromBlock: App.startingBlock});
    LogtRequest.watch(function(err, res){
      if(!err){
        $(".paying").find("thead").removeClass("nondisplay"); 
        App.viewShopping(res);
        App.userData[0] += 1;
        App.dataContainer.find('.ndeal').text(App.userData[0]);
      }
    });

    // 监听收到的交易请求
    var LogtRequest = App.blockimageInstance.LogtRequest({seller:App.account}, {fromBlock: App.startingBlock});
    LogtRequest.watch(function(err, res){
      if(!err){
        $(".dealing").find("thead").removeClass("nondisplay"); 
        App.viewReceived(res);
        App.userData[1] += 1;
        App.dataContainer.find('.npay').text(App.userData[1]);
      }
    });

    // 监听作品审核状态
    var logReply = App.blockimageInstance.LogReply({addr:App.account}, {fromBlock: App.startingBlock});
    logReply.watch(function(err, res){
      if(!err){
        App.viewImgdeal(res);
      }
    });
  },
  
  loadBlocks: function() {
    web3.eth.getBlock(web3.eth.defaultBlock, function(err,res) {    
      App.latestBlock = res.number;
      // 区块展示
      App.viewBlock(App.latestBlock,res);
      for (i = 1; i < 3; i ++) {
        web3.eth.getBlock(App.latestBlock-i, function(err,res) {
          App.viewBlock(App.latestBlock-i,res);
        })
      }
    })
  },
  
  viewBlock: function(num, res) {
    var gasLimit = res.gasLimit;
    var gasUsed = res.gasUsed;
    var hash = res.hash;
    var parentHash = res.parentHash;
    var timestamp = res.timestamp;
    
    var blocksRow = $('.blockshow');
    var blockTemplate = $('.serv');

    blockTemplate.find('.bindex').text("#" + num);
    blockTemplate.find('.vgused').text(gasUsed);
    blockTemplate.find('.vglimit').text(gasLimit);
    blockTemplate.find('.vhblock').text(hash);
    blockTemplate.find('.vhparent').text(parentHash);
    blockTemplate.find('.vtstap').text(timestamp);
    blocksRow.append(blockTemplate.html());
  },

  // Gallery
  loadImages: function() {
    var flag = 0;
    var count = 6;
    var latest = App.imagelist.length - 6*(App.imagepage-1) - 1;
    
    if(latest < 0) {
      // 无下一页
      App.imagepage -= 1;
      return;
    } else if(latest < 6){
      $("#backpage").addClass("disabled");
      count = latest + 1;
    } 

    $('.row').empty();
    for (i = 0; i < 6; i ++) {
      var latestImage = App.imagelist[latest-i];
      console.log(latestImage);
      if(!latestImage) break;

      App.blockimageInstance.getImage(latestImage, function(err, res) {
        App.viewImage(res);
        flag ++;
        if(flag == count)
          // 本页图片加载完时绑定按钮
          App.bindGalButton();
      })
    }
  },

  bindGalButton: function() {
    $('.buttbuy').unbind();
    $('.buttbuy').click(function() {
      a = event.target.name;
      var back = a.substring(3, a.length);
      var imgindex;
      imgindex = parseInt(back);

      var feebuy = document.getElementById('buyprice' + imgindex).value;
      var child = $('.modal-works');
      var feeuse = child.find('#useprice' + imgindex).text();
      var nfeeuse = parseFloat(feeuse.substring(0, feeuse.length - 3));  
      if (!App.IsNum(feebuy)) {
        Pop('请正确输入您购买图片版权的出价(仅限数字)', { Animation: 'showSweetAlert' });
      } else {
        var nfeebuy = parseFloat(feebuy);
        if (nfeebuy >= nfeeuse) {
          Pop("确认用 " + nfeebuy + "wei 购买该图片版权吗？", "confirm", function() {
              Pop("请在钱包中确认交易，随后耐心等待作者接收与回复", "confirm", function() {
                App.userFunc(5, imgindex, nfeebuy, null, null);
              });
          });
        } else {
          Pop('您购买图片版权的出价最少应大于图片的使用价格' + nfeeuse +'wei', { Animation: 'showSweetAlert' });
        }
      }
    });

    $('.buttuse').unbind();
    $('.buttuse').click(function() {
      a = event.target.name;
      var back = a.substring(3, a.length);
      var imgindex;
      imgindex = parseInt(back);
      var feebuy = document.getElementById('buyprice' + imgindex).value;
      var child = $('.modal-works');
      var feeuse = child.find('#useprice' + imgindex).text();
      var nfeeuse = parseFloat(feeuse.substring(0, feeuse.length - 3));
      if (!App.IsNum(feebuy)) {
        Pop('请正确输入您购买图片版权的出价(仅限数字)', { Animation: 'showSweetAlert' });
      } else {
        var nfeebuy = parseFloat(feebuy);
        if (nfeebuy >= nfeeuse) {
          Pop("确认用 " + nfeebuy + "wei 购买该图片使用权吗？", "confirm", function(){
            Pop("请在钱包中确认交易", { Animation: 'showSweetAlert' });
            //发送交易数据
            App.userFunc(2, imgindex, nfeebuy, null, null);
          });
        } else {
          Pop('您购买图片使用权的出价最少应大于作者指定的价格' + nfeeuse +'wei', { Animation: 'showSweetAlert' });
        }
      }
    });
  },

  bindPageChange: function(){
    var imgTemplate = $('.pagination');
    if (App.imagepage == 1)
        $("#frontpage").addClass("disabled");

    document.getElementById("frontpage").addEventListener("click", function() {
        imgTemplate = $('.pagination');
        if (App.imagepage > 1)
        {
          App.imagepage = App.imagepage - 1;
          App.loadImages();
          imgTemplate.find('.currentpage').text(App.imagepage);
        }
            
        if (App.imagepage == 1)
            $("#frontpage").addClass("disabled");
        $('#backpage').removeClass('disabled');
    });

    document.getElementById("backpage").addEventListener("click", function() {
        imgTemplate = $('.pagination');
        App.imagepage = App.imagepage + 1;
        App.loadImages();
        imgTemplate.find('.currentpage').text(App.imagepage);
        if (App.imagepage == 2)
            $("#frontpage").removeClass("disabled");
    });
  },

  // 单张图片加载
  viewImage: function(res) {
    var index = res[0]
    var username = res[1];
    var email = res[2];
    var oHash = res[3];
    var eHash = res[4];
    var wHash = "https://ipfs.io/ipfs/"+res[5]; // IPFS图片链接
    var fee = res[6] + "wei";

    var imgsRow = $('.row');
    var imgTemplate = $('.gal');
    var imgid = "Modal-"+index;
    var target = "#Modal-"+index;

    imgTemplate.find('img').attr('src', wHash);
    imgTemplate.find('a').attr('data-target', target);
    imgTemplate.find('.orihash').text(oHash);
    imgTemplate.find('.ehash').text(eHash);
    imgTemplate.find('.author').text(username);
    imgTemplate.find('.imgindex').text(index);
    imgTemplate.find('.imgprice').attr('id', 'useprice' + index);
    imgTemplate.find('.imgprice').text(fee);
    imgTemplate.find('.imgemail').text(email);
    imgTemplate.find('.modal').attr('id', imgid);
    imgTemplate.find('.price').attr('id', 'buyprice' + index); //购买图片的出价
    imgTemplate.find('.buttbuy').attr('name', 'buy' + index);
    imgTemplate.find('.buttuse').attr('name', 'use' + index);
    imgsRow.append(imgTemplate.html());
  },

  bindSearch: function() {
    $('.imgsearonclick').click(function(event){
      event.preventDefault();

      var imgindex = document.getElementById('indexsearch').value;
      if (/^\d+$/.test(imgindex)) {
        var index = parseInt(imgindex);
        console.log(index);
        var child = $('.imgsearch');
        App.blockimageInstance.getImage(index, function(err,res){
          console.log("search",res);
          if(res[5] != ""){
            var index = res[0]
            var username = res[1];
            var email = res[2];
            var oHash = res[3];
            var eHash = res[4];
            var wHash = "https://ipfs.io/ipfs/"+res[5]; // IPFS图片链接
            var fee = res[6] + "wei";
            var timestamp = res[7];
            
            child.find('.imgindex').text(index);
            child.find('.owner').text(username);
            child.find('.email').text(email);
            child.find('.ohash').text(oHash);
            child.find('.ehash').text(eHash);
            child.find('.fee').text(fee);
            child.find('.timestamp').text(timestamp);
            child.find('img').attr('src', wHash);
            
            $('.imgsearch').removeClass("nondisplay");
            $(".single").addClass("nondisplay");
            $(".contact").addClass("nondisplay");
            $(".services").addClass("nondisplay");
            $(".gallery").addClass("nondisplay");
            $(".upload").addClass("nondisplay");
            $("#li2").removeClass("active");
            $("#li4").removeClass("active");
            $("#li3").removeClass("active");
            $("#li1").removeClass("active");
            
            $('.showuser').click(function(){
              App.getIusers(index);
            });
          } else {
            Pop("该图片不存在或未通过审核", { Animation: 'showSweetAlert' });
          }
        });
      } else {
        Pop("请正确输入图片编号", { Animation: 'showSweetAlert' });
    }    
    });
  },
  
  getIusers: function(iIndex) {
    // var iIndex;
    App.blockimageInstance.getIusers(iIndex,function(err, res) {
      // 弹窗:展示使用者address
      var iusers = res;
      console.log("iusers:", iusers);
      for (i = 0; i < iusers.length; i++) {
        if(i == 0)
          var usertext = iusers[i] + "</br>";
        else
          usertext = usertext + iusers[i] + "</br>";
      }
      Pop(usertext, { Animation: 'showSweetAlert' }); 
    });
  },
  
  bindSubmit: function() {
    $('.contactsubmit').click(function(event){
      event.preventDefault();

      var nickname = document.getElementById('cnickname').value;
      var email = document.getElementById('cemail').value;
      var publicKey = document.getElementById('pubkey').value;
      var username = document.getElementById('cusername').value;
      var id = document.getElementById('cid').value;
      var sex = document.getElementById('cusersex').value;
      var age = document.getElementById('cage').value;

      App.blockimageInstance.submit(nickname, email, publicKey, function(err,res){
        Pop("认证申请已上链，请等待审核！交易号为" + res, { Animation: 'showSweetAlert' });
        // 账号与实名信息发送给认证器
        var fd = new FormData();
        fd.append("username", username);
        fd.append("id", id);
        fd.append("sex", sex);
        fd.append("age", age);
        fd.append("account", App.account);

        var xhr = new XMLHttpRequest();
        xhr.open("post", App.processorIP + "sendcontact", true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            var jsonbj = JSON.parse(xhr.responseText);
            switch (jsonbj.flag) {
              case 0:
                Pop("验证通过，请等待信息上链", { Animation: 'showSweetAlert' });
                break;
              case 1:
                Pop("验证失败，请填入您的正确身份信息", { Animation: 'showSweetAlert' });
                break;
            }
            k = 0;
          }
        };
        xhr.send(fd);
      });
    })
  },
  
  bindVerify: function() {
    $('.getkeybtn').click(function() {
      // 查询公钥
      var account = document.getElementById('account1').value;
      App.blockimageInstance.users(account, function(err, res){
        var publicKey = res[4];
        var leftstr = publicKey.substring(0, publicKey.length/2);
        var rightstr = publicKey.substring(publicKey.length/2, publicKey.length);
        Pop("对方公钥：<br/>" + leftstr + "<br/>" + rightstr, "copy", function(){
          var clipboard = new ClipboardJS(".btn-primary", {
            text: function() {
              return $(".box-content").text();
            }
          });
        });
      })
    })

    $('.codesubmit').click(function() {
      var account = document.getElementById('account1').value;
      var enccode = document.getElementById('enccode').value;
      // 发送验证码
      App.blockimageInstance.sendAuthcode(account, enccode, function(err, res){
        console.log(res);
        Pop("验证码发送成功！交易号为" + res, { Animation: 'showSweetAlert' });
      })
    })
  },

  // 个人页面：用户信息
  viewInfo: function(res) {
    var username = res[1];
    var email = res[2];
    var earnings =res[3];
    var infoHash = res[5];

    var child = $('.search1');
    child.find('.username').text(username);
    child.find('.useremail').text(email);
    child.find('.infohash').text(infoHash);
    child.find('.earnings').text(earnings);
    App.dataContainer.find('.username').text(username);
    
    // 绑定收益的提款按钮
    $('.withdrawal').click(function() {
      if (earnings > 0) {
        App.userFunc(3, null, null, null, null);
        Pop("请在钱包中确认提款交易", { Animation: 'showSweetAlert' });
      }else
        Pop("当前无可提款项T^T", { Animation: 'showSweetAlert' });  
    });
  },

  // 个人页面：购物车
  viewShopping: function(res) {
    var info = res.args;
    var tIndex = info.tIndex.toNumber();
    var iIndex = info.iIndex.toNumber();
    var seller = info.seller;
    var price = info.money;
    console.log('shopping: i am buyer', info, tIndex, iIndex, seller, price);

    var child = $('.waitpay');
    var parent = $('.paying');
    child.find('.burindex').text(tIndex);
    child.find('.imgindex').text(iIndex);
    child.find('.seller').text(seller);
    child.find('.imgprice').text(price);
    child.find('.paystate').attr('id', 'pay' + tIndex);
    child.find('.paystate').text("");
    child.find('.undo').attr('id', 'undo' + tIndex);
    parent.append(child.html());

    $('.undobtn').unbind('click');
    $('.undobtn').click(function() {
      var tIndex = event.target.name;
      console.log(tIndex);
      App.userFunc(7, tIndex, null, null, null);
      var chi = $('tr');
      var str = '#pay' + String(tIndex);
      chi.find(str).text("已撤销");
      chi = $('#undo' + String(tIndex));
      chi.find('.undobtn').attr('id', 'nondisplay');
    });

    // 读取发出的交易请求状态[shopping-state]
    App.blockimageInstance.transactions(tIndex, function(err, res){
      console.log("shopping-state? transactions:" + res);
      if(!err){
        var tIndex = res[4].toNumber();
        var state = res[0];
        var child = $('.paying');
        var str = '#pay' + String(tIndex);
        var strbtn = '#undo' + String(tIndex);
        var child2 = $(strbtn);
        if (state == 0){
          child.find(str).text("未处理");
          child2.find('.undobtn').attr('id', '');
          child2.find('.undobtn').attr('name', String(tIndex));
        }
        else if (state == 1)
          child.find(str).text("已同意");
        else if (state == 2)
          child.find(str).text("已拒绝");
        else
          child.find(str).text("已撤销");
      }
    })
  },

  // 个人页面：收到的请求
  viewReceived: function(res) {
    var info = res.args;
    var tIndex = info.tIndex.toNumber();
    var iIndex = info.iIndex.toNumber();
    var buyer = info.buyer;
    var price = info.money;
    console.log(res);

    var child = $('.waitdeal');
    var parent = $('.dealing');
    child.find('.burindex').text(tIndex);
    child.find('.imgindex').text(iIndex);
    child.find('.buyer').text(buyer);
    child.find('.imgprice').text(price);
    child.find('.dealstate').text('');
    child.find('.butt1').attr('id', 'nondisplay');
    child.find('.butt2').attr('id', 'nondisplay');
    child.find('.dealstate').attr('id', 'dealstate' + tIndex);
    child.find('.dealchoice').attr('id', 'dealchoice' + tIndex);
    child.find('.deal').attr('id', 'deal' + tIndex);
    child.find('.butt1').attr('name', 'agreed' + tIndex);
    child.find('.butt2').attr('name', 'reject' + tIndex);
    parent.append(child.html());

    $('.butt1').unbind('click');
    $('.butt1').click(function() {
      a = event.target.name;
      var back = a.substring(6, a.length);
      var flag = 1;
      var burindex;
      burindex = parseInt(back);
      App.userFunc(6, flag, burindex, null, null);
      // 同意了之后改变作品状态
      var chi1 = $('#deal' + burindex);
      var str = '#dealstate' + burindex;
      var str2 = '#dealchoice' + burindex;
      var chi2 = $(str2);
      chi1.find(str).text("已同意");
      chi2.find('.butt1').attr('id', 'nondisplay');
      chi2.find('.butt2').attr('id', 'nondisplay');
    });

    $('.butt2').unbind('click');
    $('.butt2').click(function() {
        a = event.target.name;
        var back = a.substring(6, a.length);
        var flag = 0;
        var burindex;
        burindex = parseInt(back);
        App.userFunc(6, flag, burindex, null, null);
        // 拒绝了之后改变作品状态
        var chi1 = $('#deal' + burindex);
        var str = '#dealstate' + burindex;
        var str2 = '#dealchoice' + burindex;
        var chi2 = $(str2);
        chi1.find(str).text("已拒绝");
        chi2.find('.butt1').attr('id', 'nondisplay');
        chi2.find('.butt2').attr('id', 'nondisplay');
    });

    // 读取收到的的交易请求状态 [received-state]
    App.blockimageInstance.transactions(tIndex, function(err, res) {
      console.log("received-state? transactions:" + res);
      if(!err){
        var tIndex = res[4].toNumber();
        var state = res[0];
        var chi1 = $('.dealing');
        var chi2;
        var str2, str;
        str = '#dealstate' + tIndex;
        str2 = '#dealchoice' + tIndex;
        chi2 = $(str2);
        if(state == 0) {
          chi1.find(str).text("未处理");
          chi2.find('.butt1').attr('id', '');
          chi2.find('.butt2').attr('id', '');          
        }
        else if (state == 1) 
          chi1.find(str).text("已同意");
        else if(state == 2)
          chi1.find(str).text("已拒绝");
        else
          chi1.find(str).text("已撤销");
      }
    });
  },

  // 个人页面：个人作品
  viewWork: function(res) {
    var oHash = res[1];
    var eHash = res[2];
    var wHash = "https://ipfs.io/ipfs/"+res[3];
    var timestamp = res[4]; 
    var owner = res[5];
    var index = res[7];
    var fee = res[8];
    
    var child = $('.userwork');
    var parent = $('.related-posts1');

    var child1 = $('.workinfo');
    var parent1 = $('.worksinfo');
    child.find('img').attr('src', wHash);
    child.find('a').attr('href', '#work' + index);
    parent.append(child.html());

    child1.find('img').attr('src', wHash);
    child1.find('.tab-pane').attr('id', 'work' + index);
    child1.find('.ohash').text(oHash);
    child1.find('.ehash').text(eHash);
    child1.find('.timestamp').text(timestamp);
    child1.find('.owner').text(owner);
    child1.find('.imgindex').text(index);
    child1.find('.fee').text(fee);
    parent1.append(child1.html());
  },

  // 个人页面：购买的作品
  viewBought: function(res) {
    var oHash = res[1];
    var eHash = res[2];
    var wHash = "https://ipfs.io/ipfs/"+res[3];
    var timestamp = res[4]; 
    var index = res[7];
    var fee = res[8];

    var child = $('.userwork');
    var parent = $('.related-posts2');
    var child1 = $('.buyinfo');
    var parent1 = $('.buysinfo');
    child.find('img').attr('src', wHash);
    child.find('a').attr('href', '#work' + index);
    parent.append(child.html());

    child1.find('img').attr('src', wHash);
    child1.find('.tab-pane').attr('id', 'work' + index);
    child1.find('.ohash').text(oHash);
    child1.find('.ehash').text(eHash);
    child1.find('.timestamp').text(timestamp);
    child1.find('.imgindex').text(index);
    child1.find('.fee').text(fee);
    child1.find('.getkey').attr('name', 'work' + index);
    parent1.append(child1.html());

    App.keycount++;
    if (App.keycount == App.userBought.length)
      App.bindKeyRequest();
  },

  // 个人页面：上传状态
  viewImgdeal: function(res) {
    var info = res.args;
    var index = info.index.toNumber();
    var pro = info.pro;

    var child = $('.imgdeal');
    var parent = $('.imgdeals');

    child.find('.picindex').text(index);
    child.find('.workstate').attr('id', 'workstate' + index);
    child.find('.workchoice').attr('id', 'workchoice' + index);
    parent.append(child.html());
    child = $('.imgdeals');
  
    var str = '#workstate' + index;
    var str2 = '#workchoice' + index;
    var chi1 = $(str2);
    if(pro){
      var eHash = info.eHash;
      var wHash = info.wHash;
      child.find(str).text("同意");
      chi1.find('.butt').attr('id', '');
      chi1.find('.ehash').attr('id', '');
      chi1.find('.vehash').text(eHash);
      chi1.find('.whash').attr('id', '');
      chi1.find('.vwhash').text(wHash);
    }
    else {
      child.find(str).text("拒绝");
      chi1.find('.butt').attr('id', 'nondisplay');
      chi1.find('.ehash').attr('id', 'nondisplay');
      chi1.find('.whash').attr('id', 'nondisplay');
    } 
  },

  userFunc: function(mode, a, b, c, d) {
    // 获取用户账号
    web3.eth.getAccounts(function(error, accounts) {
      if (error || !accounts || accounts.length == 0) {
        console.log("please add an account!", error);
      }else{
        var account = accounts[0];
        if(account != App.account) {
          // 加载新账户
          App.account = account;
          return App.getAuthen();
        }
        if(App.authentication) {
          if(mode == 1) return App.upload(a, b, c, d);
          else if(mode == 2) return App.use(a, b);
          else if(mode == 3) return App.withdraw();
          else if(mode == 4) return App.myKeyRequest(a);
          else if(mode == 5) return App.transRequest(a, b);
          else if(mode == 6) return App.transReply(a, b);
          else if(mode == 7) return App.refund(a);
          else if(mode == 8) return App.getAuthCode(a);
        }
        Pop("请授权已经平台认证的账户！", { Animation: 'showSweetAlert' });
      }
    });
  },
  
  bindUpload: function(){
    var firstUpload = new FileUploadWithPreview('myFirstImage');
    var firstUploadInfoButton = document.querySelector('.upload-info-button--first');
    firstUploadInfoButton.addEventListener('click', function() {
      // 求时间戳、原图hash
      var oHash;
      var timestamp=new Date().getTime();
      var files = $("#imgselector")[0].files;
      var filetype = files[0].type;
      var imagefee = document.getElementById('imagefee').value
      var fileReader = new FileReader();
      var spart = new SparkMD5();

      fileReader.readAsBinaryString(files[0].slice(0, files[0].size))
      fileReader.onload = function(e) {
        spart.appendBinary(e.target.result);
        oHash = spart.end();
        // oHash = sm3(e.target.result);
        console.log(oHash, timestamp, imagefee);
        App.userFunc(1, files, oHash, timestamp, imagefee);
      };
    })
  },

  upload: function(files, oHash, timestamp, imagefee){ 
    App.blockimageInstance.upload(oHash, timestamp, imagefee,function(err,res){
      console.log(res);
      // 监听上传作品状态
      var logUpload = App.blockimageInstance.LogUpload({addr: App.account, timestamp: timestamp},
                      {fromBlock: App.latestBlock});
      logUpload.watch(function(err, res){
        console.log(err, res);
        if(!err){
          console.log(res);
          var info = res.args;
          var iIndex = info.index;
          var accepttype = ['image/png', 'image/jpeg'];
          var filetype = files[0].type;
          // 获得图片编号，与图片一起发送给处理器
          if (!isNaN(imagefee)) {
            for (i = 0; i < accepttype.length; i++) {
              if (filetype == accepttype[i]) {
                App.imgupload(files[0], iIndex, oHash);
              }
            }
          } else {
            Pop("请正确输入图片价格", { Animation: 'showSweetAlert' });
          }
        }
        logUpload.stopWatching();
      })
    })
  },

  imgupload: function(file, iIndex, oHash, fn) {
    var startTime = new Date();
    doUpload(file, oHash);

    function doUpload(file, md5value) {
      var startIndex = 0;
      var reader = new FileReader();
      var step = 1024 * 1000; // 每次读取400KB
      var cuLoaded = startIndex;
      var total = file.size;

      reader.onload = function(e) {
        var result = reader.result;
        var loaded = e.loaded;
        uploadFile(result, cuLoaded, function() {
          cuLoaded += loaded;
          var timerange = (new Date().getTime() - startTime.getTime()) / 1000;
          console.log(timerange)
          if (cuLoaded < total) {
            readBlob(cuLoaded);
          } else {
            console.log('总共用时：' + timerange);
            cuLoaded = total;
            Pop("上传成功！请耐心等待信息上链以及发送到处理器的审核", { Animation: 'showSweetAlert' });
            sendfinish(iIndex); //告知服务器上传完毕
          }
        });
      };
      readBlob(cuLoaded);
      //指定开始位置，分块读取文件
      function readBlob(start) {
        //指定开始位置和结束位置读取文件
        var end = start + step >= file.size ? file.size : start + step;
        var blob = file.slice(start, end); //读取开始位置和结束位置的文件
        reader.readAsArrayBuffer(blob); //读取切割好的文件块
      }
      //继续
      function containue() {
        readBlob(cuLoaded);
      }

      var k = 0;
      function sendfinish(iIndex) {
        var fd = new FormData();
        fd.append("filename", file.name);
        fd.append("md5value", md5value);
        fd.append("totalsize", file.size);
        fd.append('iIndex', iIndex);
        fd.append('time', startTime.getTime());

        var xhr = new XMLHttpRequest();
        xhr.open("post", App.processorIP + "finishupload", true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            if (fn) {
              fn();
            }
            k = 0;
          } else if (xhr.status === 500) {
            setTimeout(function() {
              if (k < 3) {
                sendfinish(iIndex);
              }
              k ++;
            }, 300);
          }
        };
        xhr.send(fd);
      }

      var m = 0;
      function uploadFile(result, startindex, onSuccess) {
        var blob = new Blob([result]);
        var fd = new FormData();
        fd.append("file", blob);
        fd.append("md5value", md5value);
        fd.append("filename", file.name);
        fd.append("filesize", file.size);
        fd.append("loaded", startindex);
        fd.append('time', startTime.getTime());

        var xhr = new XMLHttpRequest();
        xhr.open("post", App.processorIP + "uploadfile", true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            m = 0;
            if (onSuccess) onSuccess();
          } else if (xhr.status === 500) {
            setTimeout(function() {
              if (m < 3) {
                console.log("sendfinish");
              }
              m ++;
            }, 1000);
          }
        };
        xhr.send(fd);
      }
    }
  },
  
  use: function(iIndex, fee){
    // var iIndex;
    App.blockimageInstance.use(iIndex, {value: fee}, function(err, res){
      tips = "您已成功购买" + iIndex + "号图片的使用权，</br>交易号为" + res;
      Pop(tips, { Animation: 'showSweetAlert' });
    });
  },

  withdraw: function() {
      App.blockimageInstance.withdraw(function(err, res) {
        tips = "提取收益成功，将在区块确认后到账。</br>交易号为" + res;
        Pop(tips, { Animation: 'showSweetAlert' });
        $('.search1').find('.earnings').text(0);
      });
  },

  transRequest: function(iIndex, price) {
    App.blockimageInstance.transactionRequest(iIndex, {value: price}, function(err,res) {
      tips = iIndex + "号图片版权购买请求已发送成功，</br>交易号为" + res;
      Pop(tips, { Animation: 'showSweetAlert' });
    });
  },

  transReply: function(pro, iIndex) {
    // var pro;
    // var iIndex;
    if(pro){
      App.blockimageInstance.transactionApprove(iIndex, function(err, res) {
        tips = iIndex + "号图片转让请求已同意，</br>交易号为" + res;
        Pop(tips, { Animation: 'showSweetAlert' });
      });
    }else{
      App.blockimageInstance.transactionRefuse(iIndex, function(err, res) {
        tips = iIndex + "号图片转让请求已拒绝，</br>交易号为" + res;
        Pop(tips, { Animation: 'showSweetAlert' });
      });
    }
  },
  
  bindKeyRequest: function() {
    $('.getkey').click(function() {
      var a = event.target.name;
      var strindex = a.substring(4, a.length);
      iIndex = parseInt(strindex);
      App.userFunc(4, iIndex, null, null, null);
    })
  },

  myKeyRequest: function(index) {
    App.blockimageInstance.myKeyRequest(iIndex, function(err, res){
      Pop("密钥申请发送成功,收到回复后会有弹窗提醒~" + "</br>交易号为" + res, { Animation: 'showSweetAlert' }); 

      web3.eth.getBlock(web3.eth.defaultBlock, function(err,res) {    
        startingBlock = res.number;
        
        // [无记忆]从当前区块开始：监听定制密钥请求的回复
        var logkSend = App.blockimageInstance.LogkSend({owner: App.account}, {fromBlock: startingBlock});
        logkSend.watch( function(err, res) {
          if(!err){
            console.log("received key",res);
            var userkey = res.args.userkey;
            
            App.blockimageInstance.images(index, function(err, res) {
              var oHash = res[1];
              var strkey;
              for(i = 0; i < 4; i++) {
                linestr = userkey.substring(56*i, 56 * (i + 1));
                if (i==0)
                strkey = linestr + "</br>"
              else
                strkey += linestr + "</br>"
              }
              tips = "img#{0}</br>密图哈希:{1},</br>您的定制密钥:</br>{2},</br>请自行存储!可复制到客户端软件完成图片解密~"
                    .format(iIndex, oHash, strkey);
              Pop(tips, "copy", function(){
                var clipboard = new ClipboardJS(".btn-primary", {
                  text: function() {
                    return $(".box-content").text();
                  }
                });
              });
            });
          }
          logkSend.stopWatching();
        });
      });

    });
  },

  refund: function(iIndex) {
    App.blockimageInstance.refund(iIndex, function(err,res) {
      tips = iIndex + "号图片版权购买请求已撤销，</br>交易号为" + res;
      Pop(tips, { Animation: 'showSweetAlert' });
    });
  },

  bindAuthen: function() {
    // 绑定“获取验证码”按钮
    $('.getcodebtn').click(function() {
      var sender = document.getElementById('account2').value;
      App.userFunc(8, sender, null, null, null);
    })
  },
  
  getAuthCode: function(sender) {
    // 传入输入的sender地址
    web3.eth.getBlock(web3.eth.defaultBlock, function(err,res) {    
      // 更新最新区块号
      App.latestBlock = res.number;
      var logcSend = App.blockimageInstance.LogcSend({sender: sender, receiver:App.account}, 
                     {fromBlock: App.latestBlock});
      logcSend.watch(function(err, res){
        console.log(err, res);
        if(!err){
          console.log(res);
          var info = res.args;
          var authcode = info.authcode;
          var parent = $('.getenccode');
          parent.find('textarea').text(authcode);
        }
        logcSend.stopWatching();
      })
    });
  },

  IsNum: function(s) {
    if (s != null && s != "") {
      return !isNaN(s);
    }
    return false;
  },

};

// 格式化字符串
String.prototype.format = function(args) {
  var result = this;
  if (arguments.length < 1) {
    return result;
  }
  var data = arguments;
  //如果模板参数是数组
  if (arguments.length == 1 && typeof (args) == "object") {
    data = args;
  }
  for (var key in data) {
    var value = data[key];
    if (undefined != value) {
      result = result.replace("{" + key + "}", value);
    }
  }
  return result;
}

$(function() {
  App.initWeb3();
});
