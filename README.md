TIGERi
===================

### What is TIGERi ?

----------

 **TIGERi Project** includes 2 parts :
 
> **1) A server part ( NODEjs - Websocket )** 

> **2) A client part ( HTML5 - Javascript - Websocket )** 

----------
### DEMO 

In Real Life :
```sequence
Alice->Bob: Hello Bob, how are you?
Bob-->Alice: I am good thanks!
```

Technically :

> - The server functions as a communication bridge  : 
```sequence
Alice(Client)->SERVER: Hello Bob, how are you?
SERVER->Bob(Client): Hello Bob, how are you?

Bob(Client)-->SERVER: I am good thanks!
SERVER-->Alice(Client): I am good thanks!
```

> - Bidirectional communication between client and server :
Bob(Client)<-->SERVER<-->Alice(Client)
```

### How To Use TIGERi ?

You can use it like this:

( Documentation will be available as soon as possible )
