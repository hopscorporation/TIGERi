#!/bin/env node

var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()

var ipaddress   = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port        = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var isOpenShift = process.env.OPENSHIFT_NODEJS_PORT ? true : false;

app.use(express.static(__dirname + "/"))

console.log( "IP: "+ipaddress+" Port: "+port
		+( isOpenShift ? " OpenShift mode" : " Standalone mode" ) );

var server = http.createServer(app)
server.listen(port,ipaddress)

console.log("http server listening on %s:%d",ipaddress, port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

//----------------------------------------------------------------------

//Functions not used.
function generatecode(n){
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function checkAccess(a,b)
{   if(a !="" && b!="" && typeof a !== 'undefined' && typeof b !== 'undefined' && a !== null && b !== null )
    if(99999===parseInt(a)+parseInt(b) ){return true;}
    return false;
}

//----------------------------------------------------------------------
function Client(id,ws,NetworkManager){
    var Messages={Sent:0,Received:0,inbox:[]};
    var destination="";
    var self=this;
    
    this.infos={type:"",ip:"",mac:"",geo:"",connection_time:getTIME_NOW()};

    
    this.set=function(key,value){this["infos"][key]=value; return this;};
    this.get=function(key){ if(this.hasInfo(key)){return this["infos"][key];} return null;};
    
    this.hasInfo=function(a){
        if(typeof(a)!=="string" || a===""){return false;}
        return this["infos"].hasOwnProperty(a);
    };
    
    function msg(data){ws.send(data, function() {  });}
    this.send=function (data){ console.log("Sending Message To "+id); msg(data); };

    function IncS(){Messages.Sent++;}
    function IncR(){Messages.Received++;}

    function getDestination(){ return destination; }
    this.getDestination=function(){return getDestination();}

    function AnalyseCommand(command,data){
        switch(command.toLowerCase()){
            case "dis":
            case "close":
            case "disconnect":
                ws.close();
                break;
				
            case "configs":
            case "infos":
            case "stat":
                ws.send("Client Informations [ "+id+" - Connected Clients : "+NetworkManager.Count()+" ] : "+JSON.stringify(self), function() {  })
                break;
				
            case "all_configs":
            case "all_infos":
            case "all_stat":
                var r="All Clients Informations : "; var c = NetworkManager.getClients();
                for(k in c){
                    r+="\n\nClient Informations [ "+k+" - Connected Clients : "+NetworkManager.Count()+" ] : \n"+JSON.stringify(c[k]);
                }
				
                ws.send(r, function() {  })
                break;

            case "destinations":
                var r="\n\nAll Clients Destinations : \n\nClient_N \t| Destination\n--------------------------------------"; var c = NetworkManager.getClients();
                for(k in c){
                    r+="\n"+k+" \t| "+JSON.stringify(c[k].getDestination());
                }
				
                ws.send(r, function() {  })
                break;
			
            case "change ip":
            case "set ip":
            case "update ip":
                if(ValidateIPaddress(data)==true){
                    self.set("ip",data); ws.send("The new IP : "+JSON.stringify( self.get("ip") ), function() {  })
                }else{ws.send("Error,>>> "+data+" <<< is not a valid IP address !!", function() {  })}
                break;
		    
            case "ip":
            case "get ip":
                ws.send("IP : "+JSON.stringify( self.get("ip") ), function() {  });
                break;	
				
            case "change mac":
            case "set mac":
            case "update mac":
                if(ValidateMACaddress(data)==true){
                    self.set("mac",data); ws.send("The new MAC : "+JSON.stringify( self.get("mac") ), function() {  })
                }else{ws.send("Error,>>> "+data+" <<< is not a valid MAC address !!", function() {  })}
                break;
		    
            case "mac":
            case "get mac":
                ws.send("MAC : "+JSON.stringify( self.get("mac") ), function() {  });
                break;	
				
            case "my id":
            case "myid":
            case "id":
            case "me":
                ws.send("ID : "+id, function() {  });
                break;	

            case "change id":
            case "set id":
            case "update id":
                RenameID(data); ws.send("The new ID : "+id, function() {  });
                break;
                
            case "change type":
            case "set type":
            case "update type":
                self.set("type",data); ws.send("The new TYPE : "+JSON.stringify( self.get("type") ), function() {  })
                break;
		    
            case "type":
            case "get type":
                ws.send("TYPE : "+JSON.stringify( self.get("type") ), function() {  })
                break;	
				
            case "unselect dagent":				
            case "no dagent":	
            case "reset dagent":  
                destination="";ws.send("Destination ID : None !!!", function() {  })
                break;	
				
            case "dagent":	
            case "get dagent":  
                if(destination==""){ws.send("Destination ID : None !!!", function() {  })}
                else{ws.send("Destination ID : "+destination, function() {  })}
				
                break;	
			
            case "use dagent":
            case "select dagent":
            case "set dagent":
                //data message mode  
                if(data.length<1){ws.send("Error , Please Specify A Destination First !!!", function() {  })}
                else{

                    if(NetworkManager.hasClient(data)===true){destination=data;ws.send("New Destination ID : "+destination+"\nConfirmed !!!", function() {  })}
                    else{ws.send("Error,Please Specify A Valid Destination ID !!!", function() {  })}
                }
                break;	
				
            case "sendtodagent": 
            case "send": 
            case "emit":	
                if(destination==""){ws.send("Error , Please Specify A Destination First !!!\nUse [set agent@ID] To Specify An Agent.", function() {  })}
                else
                {
                    if(data.length<1){ws.send("Error , No Content To Be Sent !!!", function() {  })}
                    else{
                        if(NetworkManager.hasClient(destination)===true){
                            NetworkManager.getClients()[destination].send(data);
                            ws.send("Data Was Sent Without Errors !!!", function() {  });
                        }else{ws.send("Error , Unable To Send Data , Destination Disconnected  !!!", function() {  })}
						
                    }
                }
                break;		
				
				
            default:
                ws.send("Sorry ,>>> "+command+" <<< is not a valid command !!!", function() {  })
                break;
        }//End of switch
    }


    function RenameID(newid){
        if( typeof(newid)==="string" ){
            if( newid != id ){

                
                NetworkManager.getClients()[newid]=NetworkManager.getClients()[id];// not tested yet (test must be done with all_infos@ )
                delete NetworkManager.getClients()[id];
                id=newid;
                
            }
        }
        
    }
    
    ws.on('message', function incoming(message,flags) {  
        IncR();
        console.log('received: %s', message);

        if(!flags.binary){
	
            //********************************************************	   
            //if( bFakeClient==true){ bFakeClient=!(checkAccess(message,client_code));} else{
            //Client is not fake !!!
            //testing if message is a command (  [ COMMAND| ] ),// get_client_list|  ,or send|| (take |)
            var pos=message.indexOf("@");
            if(pos>0){  // minimal size of command is 1 so minimal pos of "|" is 1 , exp : c|content  012....n
                var command=message.substring(0, pos); console.log("command = "+command);
                var data=message.substring(pos+1); console.log("data = "+data);
                if(data[data.length-1] === "@"){ data=data.slice(0, -1);  console.log("new data = "+data);}
                
                AnalyseCommand(command,data);
		
            }//End of command check test
            // }//End of else (fake client identity test) 
            //********************************************************

        } //End Of Text Content Handling
        else{
            console.log(">>> Binary Data Received !!! <<<");
        } //End Of binary Content Handling


    });			
		
    ws.on("close", function() { NetworkManager.Disconnect(id); })

    ws.on('pong', heartbeat); 
    function heartbeat() {this.isAlive = true;}

    function getTIME_NOW(){
        var d = new Date,dformat = [d.getDate(),d.getMonth()+1,d.getFullYear()].join('/')+' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
        return dformat;
    }
    function ValidateIPaddress(ipaddress)   
    {  
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))  
        {  
            return (true)  
        }   
        return (false)  
    }
    function ValidateMACaddress(mac)   
    {  
        if (/^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/.test(mac))  
        {  
            return (true)  
        }   
        return (false)  
    }  
}


function Clients(){

    var clients={};
    var nbclients=0;
    var lastID=0;

    function allClients(){return clients;};
    this.getClients=function(){return allClients();}

    function NbClients(){ return nbclients;}
    this.Count=function(){return NbClients();}

    function AddClient(ws,NetworkManager){ nbclients++; lastID++; clients["client_"+lastID] = new Client("client_"+lastID,ws,NetworkManager); }
    this.Connect=function(ws){ if(isset(ws)){  AddClient(ws,this); } return this; };

    function RemoveClient(id){ delete clients[id]; nbclients--; }
    this.Disconnect=function(id){  if(this.hasClient(id)){RemoveClient(id);} return this;}

    this.hasClient=function(id){ if(typeof(id)!=="string" || id===""){return false;}  return clients.hasOwnProperty(id); };

    function isset(a){
        if(typeof a === undefined || a===null){return false;}
        return true;
    }
}
//----------------------------------------------------------------------

var c = new Clients();


wss.on("connection", function connection(ws) {
    
    c.Connect(ws);
    console.log("Websocket Connection Opened");

});

//----------------------------------------------------------------------

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
 
        ws.isAlive = false;
        ws.ping('', false, true);
    });
}, 15000);
