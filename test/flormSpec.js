'use strict';

describe('module angularFlorm',function(){
  var $rootScope,$compile,$window,$florm;

  beforeEach(module('angularFlorm'));

  beforeEach(inject(function($injector){
    $rootScope = $injector.get('$rootScope');
    $window = $injector.get('$window');
    $compile = $injector.get('$compile');
    $florm = $injector.get('$florm');
  }));

  it('my test env should be sane',function(){
    expect($florm).toBeDefined();
  });

  describe('Model Definition',function(){
    it('should not fail',function(){
      var AModel = $florm('amodel');
      expect(AModel).toEqual(jasmine.any(Object));
      expect(AModel.new).toBeDefined();
      expect(AModel.all).toBeDefined();
      expect(AModel.find).toBeDefined();
      expect(AModel.truncate).toBeDefined();
    }); 
    it('should return an empty array right now',function(){
      var model = $florm('amodel');
      // Clear the storage
      model.truncate();
      expect(model.all()).toEqual(jasmine.any(Array));
      expect(model.all().length).toEqual(0);
    });
    it('should be possible to instantiate and persist',function(){
      var model = $florm('amodel');
      var inst = model.new();
      expect(inst).toEqual(jasmine.any(Object));
      expect(inst.save).toEqual(jasmine.any(Function));
      expect(inst.id).not.toBeDefined();
      inst.testField='possum';
      inst.save();
      expect(inst.id).toBeDefined();
      expect(inst.createdAt).toEqual(jasmine.any(Date));
      expect(inst.updatedAt).toEqual(jasmine.any(Date));
      expect(inst.createdAt).toEqual(inst.updatedAt); // Compare dates, not instances.
      // let's check the management of updated_at field while we're at it.
      inst.updatedAt = new Date(0); 
      inst.save();
      expect(inst.updatedAt).not.toEqual(new Date(0));

    });
    it('all should nolonger return an empty array',function(){
      var model = $florm('amodel');
      expect(model.all()).toEqual(jasmine.any(Array));
      expect(model.all().length).toEqual(1);
    });

    it('should be deserialized an instance',function(){
      var model = $florm('amodel');
      var inst = model.all()[0];
      expect(inst).toBeDefined();
      expect(inst.testField).toBe('possum');
      expect(inst.save).toEqual(jasmine.any(Function));
    });
  });

  describe('Find things',function(){
    var Person,you,me,someone;
    // Load some fixtures,
    beforeEach(function(){
      Person = $florm('people');
      Person.truncate();
      me = Person.new({name:"Tony",sex:'male'});
      me.save();
      you = Person.new();
      you.name="Walrus";
      you.sex='male';
      you.weight=1500;
      you.save();
      someone = Person.new({name:'Ms. Mysterious',age:25,sex:'female'});
      someone.save();
    });
    it('fixtures should be sane',function(){
      expect(you.id).toBeDefined();
      expect(you.name).toBe('Walrus');
      expect(me.id).toBeDefined();
      expect(me.name).toBe('Tony');
      expect(someone.id).toBeDefined();
      expect(someone.age).toBe(25);
    });

    it("finding single enty by using id",function(){
      var dude = Person.find(you.id);
      expect(dude.name).toBe('Walrus');
      expect(dude.weight).toBe(1500);
    });
    it("finding single entry by using property",function(){
      var dudette = Person.find({sex:'female'});
      expect(dudette.id).toBe(someone.id);
    });
    it('finding all matching property',function(){
      var bros  = Person.all({sex:'male'});
      expect(bros.length).toBe(2);
    });
  });

  describe('Upping the complexity a notch',function(){
    var Cats,Yarns;

    beforeEach(inject(function($injector){
      Cats = $florm('cats',{ hasMany:'yarns' });
      Cats.truncate();
      Cats.create({name:'Scrappi'});

      Yarns = $florm('yarns',{ belongsTo: 'cats'});
      Yarns.truncate();
      Yarns.create({fibers:'cotton',color:'blue'});
      Yarns.create({fibers:'cotton',color:'red'});
    }));
    it('A cat must have room for his yarns',function(){
      var cat = Cats.all()[0];
      expect(cat.yarns).toEqual(jasmine.any(Array));
    });
    it('Associate a yarn with the cat',function(){
      Cats.first().yarns.push(Yarns.first());
      expect(Cats.first().yarns.length).toBe(1);
      expect(Yarns.first().catsId).toBe(Cats.first().id);
    });
    it('Should be possible to splice an association',function(){
      Cats.first().yarns.push(Yarns.first());
      expect(Cats.first().yarns.length).toBe(1);
      Cats.first().yarns.splice(0,1);
      expect(Cats.first().yarns.length).toBe(0);
    });
  });

});
