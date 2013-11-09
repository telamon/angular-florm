angular.module('angularFlorm',['ng'])
.value('_',_) // Require underscore.js
// Localstore Bootstrap
.factory('$store',function(){
  var config = {
    prefix: 'florm.'
  };
  return {
    set:function(key,value){
      localStorage.setItem(config.prefix+key,JSON.stringify(value));
      return value;
    },
    get: function(key,def){
      return JSON.parse(localStorage.getItem(config.prefix+key)) || def;
    },
    clear: function(){
      return localStorage.clear();
    }
  }
})
// Model reference storage for relations.
.value('_models',[])
.factory('$inflection',function(){
  return {
    singular:function(word){
      return word.replace(/^(\w)(\w+)s$/,function(s,a,b){return a.toUpperCase()+b});
    }
  };
})
// Model Base
.factory('$florm',function($store,_,$inflection){
  var guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };
  return function(ns,sub){
    typeof $store.get(ns) === 'object' || $store.set(ns,{});

    var ProtoBase = {
      fields: {
        id: 'String',
        createdAt : 'Date',
        updatedAt : 'Date'
      },
      model : $inflection.singular(ns),
      __inst : function(obj){
        if(typeof obj === 'undefined' || typeof obj !== 'object'){
          return null;
        }
        var Model= function(){};
        Model.prototype= ProtoBase;
        var instance = new Model;
        angular.extend(instance,obj);
        return instance;
      },
      truncate: function(){
        $store.set(ns,{});
      },
      all : function(terms){
        return _.map(
          (typeof terms === 'object'?_.where($store.get(ns),terms): $store.get(ns)), 
          function(i){
            return this.__inst(i)
          }.bind(this)
        );
      },
      find: function(terms){
        if(typeof terms === 'string'){
          return this.__inst($store.get(ns)[terms]);
        }

        if(typeof terms === 'object'){
          return _.findWhere(_.values($store.get(ns)),terms);
        }
        throw new Error('Find() failed:  properties or id required');
      },
      'new': function(properties){
        return this.__inst(properties||{});
      },
      save: function(){
        if(typeof this.id === 'undefined'){
          this.id = guid();
        }
        var collection = $store.get(ns);
        collection[this.id] = this;
        if(typeof this.createdAt === 'undefined'){
          this.createdAt = new Date();
        }
        this.updatedAt=new Date();
        $store.set(ns,collection);
        collection = $store.get(ns);
        return this;
      },
      create: function(properties){
        var m = this.new(properties);
        return m.save();
      }
    };
    // Aliases
    ProtoBase.findAll = ProtoBase.all;

    if(typeof sub === 'object'){
      angular.extend(ProtoBase,sub);
    }
    return ProtoBase;
  };
})
