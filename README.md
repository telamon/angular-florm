# angular-florm

This is an attempt to make a slight improvement to our santiy when
storing models in localstore.

This is in alpha/wip state, come back later.

## Installation
  
Through bower:


    $ bower install https://github.com/telamon/angular-florm.git --save


Otherwise you need to grab `angular-florm.js` from `lib/` folder

## Usage
You've probably seen this before somewhere already.


    var Users  = $florm('users');
    var user  = Users.new({name: 'foo', password : 'bar'});
    
    user.potatoes = 12;
    user.save(); // Persists using window.localStore

    Users.all({potatoes : 12});  // --> [{name:'foo', ...}]
    Users.find(user.id); // --> {name:'foo'}
    Users.find({name: 'foo'}); // --> {name:'foo'}

### Relations

    var Gorillas = $florm('gorillas',{hasMany:'bananas'}),
    Bananas = $florm('bananas',{belongsTo:'gorillas'}),
    ape = Gorillas.create();
    fruit = Banans.create();

    // Associate fruit to ape.
    ape.bananas.push(fruit);

    // Read relations
    console.log(ape.bananas); // --> [{...}]
    // -- or the reverse
    console.log(fruit.gorillas); --> {...}

    // Remove relation
    ape.banans.splice(0,1);

note: I'm skipping inflections for now, was about to add an inflection
dependency but figured it would just cause unecessary overhead. 
So in other words, you'll have to live with `fruit.gorillas` instead of
`fruit.gorilla` 



Check the sources & testspecs for more info.

