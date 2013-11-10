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
// Model Base
.factory('$florm',function($store,_){
  var guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };
  var $florm=  function(ns,sub){
    typeof $store.get(ns) === 'object' || $store.set(ns,{});

    var ProtoBase = {
      fields: {
        id: 'String',
        createdAt : 'Date',
        updatedAt : 'Date'
      },
      model : ns,
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
      },
      first: function(){
        return this.all()[0];
      }
    };
    // Aliases
    ProtoBase.findAll = ProtoBase.all;
    // Setup relations
    if(sub && typeof sub.belongsTo === 'string'){
      sub.belongsTo = [sub.belongsTo];
    }
    if(sub && typeof sub.belongsTo === 'object'){
      _.each(sub.belongsTo,function(relation){
        var localKey = relation+'Id';
        Object.defineProperty(ProtoBase, relation,{
          get:function(){return $florm(relation).find({id:this[localKey]});},
          set:function(reference){
            var remoteObj;
            if(reference !== null && typeof reference === 'object' && typeof reference.id === 'string'){
              this[localKey] = reference.id;
              this.save();
            }else if(typeof reference === 'string' || reference === null){
              this[localKey] = reference;
              this.save();
            }else{
              throw new Error("Invalid value passed to relation setter."+
                             "Allowed types are modelinstance, id or null"); 
            }
          }
        });
      });
    }
    if(sub && typeof sub.hasMany === 'string'){
      sub.hasMany = [sub.hasMany];
    }
    if(sub && typeof sub.hasMany === 'object'){
      _.each(sub.hasMany,function(relation){
        Object.defineProperty(ProtoBase, relation,{
          get:function(){
            var inst = this,
            foreignKey = this.model+'Id',
            terms ={};

            terms[foreignKey] = inst.id;
            var collection =  $florm(relation).all(terms);
            // Insert the magic
            // Overload push
            collection.push = function(){
              _.each(arguments,function(o){
                o[foreignKey]= inst.id;
                o.save();
                this[this.length]=o;
              }.bind(this));
              return this.length;
            };
            // Overload splice
            var orgSplice= collection.splice;
            collection.splice=function(){
              var spliced = orgSplice.apply(this,arguments);
              _.each(spliced,function(obj){
                delete obj[foreignKey];
                obj.save();
              });
              return spliced;
            };
            // Removal helper
            collection.remove = function(obj){
              var id;
              if(typeof obj === 'object' && typeof obj.id ==='string'){
                id = obj.id;
              }
              if(typeof obj === 'string'){
                id = obj;
              }
              if(!id){ throw new Error('Must pass a valid Model instance or UID to remove');}
              var candidate= _.findWhere(this,{id:id});
              if(candidate){
                this.splice(this.indexOf(candidate),1);
              }
            };

            return collection;
          }
        });
      });
    }

    // Inject subclass
    if(typeof sub === 'object'){
      angular.extend(ProtoBase,sub);
    }
    return ProtoBase;
  };
  return $florm;
})
