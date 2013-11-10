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
    banana = Banans.create();

    // Associate banana to ape.
    ape.bananas.push(banana);

    // Read relations
    console.log(ape.bananas); // --> [{...}]
    // -- or the reverse
    console.log(banana.gorillas); --> {...}

    // Remove relation
    ape.banans.splice(0,1);

    // Associating through belongsTo field.
    banana.gorillas = ape; // using reference
    banana.gorillas = ape.id; // using id

    // Removing an belongsTo association
    banana.gorillas = null;

    
note: I'm skipping inflections for now, was about to add an inflection
dependency but figured it would just cause unecessary overhead. 
So in other words, you'll have to live with `banana.gorillas` instead of
`banana.gorilla` 

Check the sources & testspecs for more info.

