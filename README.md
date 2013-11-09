# angular-florm

This is an attempt to make a slight improvement to our santiy when
storing models in localstore.

This is in alpha/wip state, come back later.

## Usage
You've probably seen this before somewhere already.


    var Users  = $florm('users');
    var user  = Users.new({name: 'foo', password : 'bar'});
    
    user.potatoes = 12;
    user.save(); // Persists using window.localStore

    Users.all({potatoes : 12});  // --> [{name:'foo', ...}]
    Users.find(user.id); // --> {name:'foo'}
    Users.find({name: 'foo'}); // --> {name:'foo'}


Check the sources & testspecs for more info.

