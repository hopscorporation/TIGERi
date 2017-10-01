TIGERi
===================

### What is TIGERi ?

----------

 **TIGERi Project** includes 2 parts :
 
> **1) A server part (NODEjs - Websocket)** .

> **2) A client part (HTML - Javascript - Websocket)** .

----------

### How To Use TIGERi ?

You can use it like this:

In Real Life :
```sequence
Alice->Bob: Hello Bob, how are you?
Bob-->Alice: I am good thanks!
```

Technically :
```sequence
Alice->SERVER: Hello Bob, how are you?
SERVER->Bob: Hello Bob, how are you?

Bob-->SERVER: I am good thanks!
SERVER-->Alice: I am good thanks!
```
