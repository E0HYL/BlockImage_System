pragma solidity ^0.4.18;

contract BlockImage_E0 {
    event LogUpload(address indexed addr, uint indexed timestamp, uint index);
    event LogReply(address indexed addr, uint index,  string oHash, string eHash, string wHash, bool pro);

    event LogtRequest(address indexed seller, uint tIndex, uint iIndex, address indexed buyer, uint money);

    event LogkRequest(address owner, string publicKey, string key);
    event LogkSend(address indexed owner, string userkey);

    event LogcSend(address indexed sender, address indexed receiver, string authcode);

    struct User {
        bool authentication;
        string username;
        string email;
        uint earnings;
        string publicKey;
        string infoHash;
    }

    struct Image {
        bool canPublish;
        string oHash;
        string eHash;
        string wHash;
        uint timestamp;
        address owner;
        address[] iusers;
        string key;
        uint imageIndex;
        uint fee;
    }

    struct Transaction {
        uint state;
        uint money;
        address buyer;
        uint iIndex;
        uint tIndex;
    }

    address[] public authority;
    uint private imageIndex = 0;
    uint private transactionIndex = 0;
    uint[] private pubImages;
    mapping(address => User) public users;
    mapping(uint => Image) public images;
    mapping(address => uint[]) private user_published;
    mapping(address => uint[]) private user_bought;
    mapping(uint => Transaction) public transactions;
    mapping(uint => uint[]) private img_request;
    
    modifier isAuthority {
        bool contains = false;
        for(uint i = 0; i < authority.length; i++){
            if (authority[i] == msg.sender){
                contains = true;
            }
        }
        require(contains);
        _;
    }

    modifier authenticated {
        bool data = getAuthentication(msg.sender);
        require(data == true); 
        _;
    } 

    modifier published(uint index) {
        require(images[index].canPublish == true);
        _;
    }

    modifier isOwner(uint index) {
        address owner = images[index].owner;
        require(msg.sender == owner);
        _;
    }

    modifier canDecide(uint tindex) {
        uint index = transactions[tindex].iIndex;
        address owner = images[index].owner;
        require((msg.sender == owner)&&(transactions[tindex].state == 0));
        _;
    }

    modifier canRefund(uint tindex) {
        address buyer = transactions[tindex].buyer;
        require((msg.sender == buyer) && (transactions[tindex].state == 0));
        _;
    }
    
    function BlockImage_E0() public {
        authority.push(msg.sender);   
    }

    function submit(string username,string email,string publicKey) public {
        users[msg.sender] = User({
            authentication:false,
            username:username,
            email:email,
            earnings:0,
            publicKey:publicKey,
            infoHash:""
        });
    }

    function confirm(address addr,string infoHash) public isAuthority {
        users[addr].authentication = true;
        users[addr].infoHash = infoHash;
    }
    
    function getAuthentication(address addr) public view returns(bool) {
        return users[addr].authentication;
    }
    
    function upload(string oHash,uint timestamp,uint fee) public authenticated {
        address[] memory iuser = new address[](1);
        iuser[0] = msg.sender;
        uint i = imageIndex;
        images[i] = Image({
            canPublish:false,
            oHash:oHash,
            eHash:"",
            wHash:"",
            timestamp:timestamp,
            owner:iuser[0],
            iusers:iuser,
            key:"",
            imageIndex:imageIndex,
            fee:fee
        });
        emit LogUpload(msg.sender, timestamp, imageIndex);
        imageIndex += 1;
    }

    function publish(uint index,string oHash,string eHash,string wHash,string key,bool pro) public isAuthority {
        address owner = images[index].owner;
        if(pro){
            images[index].eHash = eHash;
            images[index].wHash = wHash;
            images[index].key = key;
            images[index].canPublish = true;
            pubImages.push(index);
            user_published[owner].push(index);
        }
        emit LogReply(owner, index, oHash, eHash, wHash, pro);
    }

    function getCheckedImages() public view returns(uint[]) {
        return pubImages;
    }

    function getUserImages(address addr) public view returns(uint[],uint[]) {
        return (user_published[addr], user_bought[addr]);
    }

    function getImage(uint index) public view
    returns(uint i,string username,string email,string oHash,string eHash,string wHash,uint fee,uint timestamp){
        Image memory img = images[index];
        address owner = img.owner;
        string memory ausername = users[owner].username;
        string memory aemail = users[owner].email;
        return (index, ausername, aemail, img.oHash, img.eHash, img.wHash, img.fee, img.timestamp);
    }
    
    function use(uint index) public authenticated published(index) payable{
        uint fee = images[index].fee;
        require(msg.value >= fee);
        address owner = images[index].owner;
        users[owner].earnings += msg.value;
        images[index].iusers.push(msg.sender);
    }

    function withdraw() public {
        uint earnings = users[msg.sender].earnings;
        require(earnings > 0);
        users[msg.sender].earnings = 0;
        msg.sender.transfer(earnings);
    }

    function getIusers(uint index) public view published(index) returns(address[]) {
        return images[index].iusers;
    }
    
    function transactionRequest(uint iIndex) public authenticated published(iIndex) payable {
        transactions[transactionIndex] = Transaction({
            state:0,
            money:msg.value,
            buyer:msg.sender,
            iIndex:iIndex,
            tIndex:transactionIndex
        });
        img_request[iIndex].push(transactionIndex);
        emit LogtRequest(images[iIndex].owner, transactionIndex, iIndex, msg.sender, msg.value);
        transactionIndex += 1;
    }
    
    function transactionApprove(uint tindex) public canDecide(tindex) {
        uint iIndex = transactions[tindex].iIndex;
        for(uint i = 0; i < img_request[iIndex].length; i++) {
            uint t = img_request[iIndex][i];
            if ((t != tindex) && (transactions[t].state == 0)) {
                transactionRefuse(t);
            } 
        }
        delete img_request[iIndex];
        address buyer = transactions[tindex].buyer;
        images[iIndex].owner = buyer;
        transactions[tindex].state = 1;
        user_bought[buyer].push(iIndex);
        msg.sender.transfer(transactions[tindex].money);
    }

    function getImgRequest(uint index) public view returns(uint[]) {
        return img_request[index];
    }

    function transactionRefuse(uint tindex) public canDecide(tindex) {
        address buyer = transactions[tindex].buyer;
        transactions[tindex].state = 2;
        buyer.transfer(transactions[tindex].money);
    }

    function refund(uint tindex) public canRefund(tindex) {
        transactions[tindex].state = 3;
        uint money = transactions[tindex].money;
        msg.sender.transfer(money);
    }

    function myKeyRequest(uint index) public isOwner(index) {
        address owner = msg.sender;
        string memory publicKey = users[owner].publicKey;
        string memory key = images[index].key;
        emit LogkRequest(owner, publicKey, key);
    }

    function sendKey(address owner, string userkey) public isAuthority {
        emit LogkSend(owner, userkey);
    }

    function sendAuthcode(address receiver, string authcode) public {
        emit LogcSend(msg.sender, receiver, authcode);
    }
}