# angular-florm

A attempt to make a slight improvement to our santiy when
working model-ish objects persisted in localstore.

## Installation
  
Through bower:


    $ bower install angular-florm


Otherwise you need to grab `angular-florm.js` from `lib/` folder

## Usage
You've probably seen this before somewhere already.

    angular.module('myApp', ['ngFlorm']);
    var $florm = angular.injector(['myApp']).get('$florm')

    var Users  = $florm('users');
    var user  = Users.new({name: 'foo', password : 'bar'});
    
    user.potatoes = 12;
    user.save(); // Persists using window.localStore

    Users.all({potatoes : 12});  // --> [{name:'foo', ...}]
    Users.find(user.id); // --> {name:'foo'}
    Users.find({name: 'foo'}); // --> {name:'foo'}

### Relations

    angular.module('myApp', ['ngFlorm']);
    var $florm = angular.injector(['myApp']).get('$florm')

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

