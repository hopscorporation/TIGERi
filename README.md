                               TIGERi ![GitHub Logo](https://assets-cdn.github.com/favicon.ico)
===================

### What is TIGERi ?

----------

 **TIGERi Project** includes 2 lightweight libraries :
 
> **1) A server library ( NODEjs - Websocket )** 

> **2) A client library ( HTML5 - Javascript - Websocket )** 

----------
### DEMO 

> - In Real Life :
```sequence
Alice->Bob: Hello Bob, how are you?
Bob-->Alice: I am good thanks!
```

> - Technically :

   - [x] The server functions as a communication bridge  : 
   ```sequence
   Alice(Client)->SERVER: Hello Bob, how are you?
   SERVER->Bob(Client): Hello Bob, how are you?

   Bob(Client)-->SERVER: I am good thanks!
   SERVER-->Alice(Client): I am good thanks!
   ```

   - [x] Bidirectional communication between the client and the server :
   ```sequence
   Bob(Client)<--->SERVER<--->Alice(Client)
   ```

### How To Use TIGERi ?

You can use it like this:

( Documentation will be available as soon as possible :+1: )
