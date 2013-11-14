angular.module('ngFlorm',['ng'])
// Localstore Bootstrap
.factory('$store',function($window){
  var config = {
    prefix: 'florm.'
  };
  return {
    set:function(key,value){
      $window.localStorage.setItem(config.prefix+key,JSON.stringify(value));
      return value;
    },
    get: function(key,def){
      return JSON.parse($window.localStorage.getItem(config.prefix+key)) || def;
    },
    clear: function(){
      return $window.localStorage.clear();
    }
  }
})
// Model Base
.factory('$florm',function($store){
  var guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };

  var where= function(arr,terms){
    // TODO: this method is a stub
    var keys = Object.keys(terms);
    return arr.filter(function(obj){
      for(i=0;i<keys.length;i++){
        if(obj[keys[i]]!==terms[keys[i]]){
          return false;
        }
      }
      return true;
    });
  };
  var findWhere = function(arr,terms){
    // TODO: this method is a stub
    var keys = Object.keys(terms);
    var found = null;
    arr.filter(function(obj){
      var matching = true;
      for(i=0;i<keys.length && found === null;i++){
        if(obj[keys[i]]!==terms[keys[i]]){
          matching=  false;
        }
      }
      if(matching){
        found = obj;
      }
    });
    return found;
  };
  var values = function(obj){ return Object.keys(obj).map(function(i){return obj[i]});};

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
        var results;
        if(typeof terms === 'object'){
          results = where(values($store.get(ns)),terms);
        }else{
          results = values($store.get(ns));
        }
        return results.map(
          function(i){
            return this.__inst(i)
          }.bind(this)
        );
      },
      find: function(terms){
        var result=null;
        if(typeof terms === 'string'){
          result = this.__inst($store.get(ns)[terms]);
        }else if(typeof terms === 'object'){
          result = this.__inst(findWhere(values($store.get(ns)),terms));
        }else{
          throw new Error('Find() failed:  properties or id required');
        }
        if(result===null){
          throw new Error('Failed to find Model('+ns+') through terms'+terms);
        }
        return result;
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
        return this;
      },
      delete: function(id){
        if(id){
          return this.find(id).delete();
        }
        var collection = $store.get(ns);
        delete collection[this.id];
        $store.set(ns,collection);
        this.id=null;
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
      sub.belongsTo.forEach(function(relation){
        var localKey = relation+'Id';
        Object.defineProperty(ProtoBase, relation,{
          get:function(){return (!this[localKey]) ? undefined : $florm(relation).find(this[localKey]);},
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
      sub.hasMany.forEach(function(relation){
        Object.defineProperty(ProtoBase, relation,{
          get:function(){
            var inst = this,
            foreignKey = this.model+'Id',
            terms ={};

            terms[foreignKey] = inst.id;
            var collection =  $florm(relation).all(terms);
            // Insert the magic
            // Overload push
            var orgPush = collection.push;
            collection.add = function(){
              console.log(arguments);
            };
            collection.push = function(){
              for(i=0;i<arguments.length;i++){
                var o = arguments[i];
                o[foreignKey]= inst.id;
                o.save();
              }
              return orgPush.apply(collection,arguments);
            };
            // Overload splice
            var orgSplice= collection.splice;
            collection.splice=function(){
              var spliced = orgSplice.apply(this,arguments);
              spliced.forEach(function(obj){
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
              var candidate= findWhere(this,{id:id});
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
