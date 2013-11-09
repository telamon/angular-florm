angular.module('florm.test',['angularFlorm'])
.factory('Users', function($florm){
  return $florm('user',{});
});

//// Projects
//.factory('$projects',function($store,ModelBase){
  //var ns = 'projects';
  //var proto = ModelBase(ns, {
    //hasMany: ['tasks'],
    //setActive : function(project){
      //return $store.set(ns+".active",project);
    //},
    //getActive: function(){
      //return $store.get(ns+".active");
    //}
  //});
  //proto.fields.name = 'string';
  //proto.fields.client = 'string';
  //return proto;
//})
//// Tasks
//.factory('$tasks',function($store,ModelBase){
  //var ns = 'tasks';
  //var proto = ModelBase(ns,{
    //belongsTo:'project'
  //});
  //return proto;
/*});*/
