var app;
(function(){
  app = angular.module('notti', ['ngMaterial', 'mdColorPicker'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('pink');
    $mdThemingProvider.theme('success-toast');
    $mdThemingProvider.theme('error-toast');
    
    $mdThemingProvider.alwaysWatchTheme(true);
  })  
})();

app.controller('mainController', function($scope, $mdToast){

    $scope.notti = notti;
    $scope.isRGB = false;
    $scope.disable = true;
    $scope.isFullColor = false;
    $scope.scopeVariable = {};

    // Disabling the mouse right click event
    document.addEventListener('contextmenu', event => event.preventDefault());

    $scope.notti.onSuccess = function(message){
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .position('top')
            .theme("success-toast")
            .hideDelay(2500)
        );
    };

    $scope.notti.onError = function(message){
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .position('top')
            .theme('error-toast')
            .hideDelay(2500)
        );
    };

    $scope.$watch(
      function(scope) {
        return scope.scopeVariable.color 
      },
      function(newValue, oldValue) {
        var rgb = {};
        rgb = tinycolor(newValue);
        var r = rgb._r;
        var g = rgb._g;
        var b = rgb._b;
        var hex_data = tinycolor.toHex(r,g,b, true);
        console.log(r +''+ g +''+ b);
        console.log(hex_data);
        if(newValue)
          $scope.notti.selectRGBColor(r,g,b);
    });    

    $scope.toggleNottiLight = function() {
      if($scope.notti.isOn == false){
        $scope.isRGB = false;
        $scope.isFullColor = false;
        $scope.disable = true;
      }else{
        $scope.disable = false;
      }
      $scope.notti.toggleNottiLight($scope.notti.isOn);
    };

    $scope.selectRGBColor = function(){
      $scope.isRGB = true;
      $scope.isFullColor = false;
    };

    $scope.customColorChange = function(){
      $scope.isRGB = false;
      $scope.isFullColor = false;
      $scope.notti.customColorChange();
    };

    $scope.fullColorChange = function(){
      $scope.isRGB = false;
      $scope.isFullColor = true;
    };

    $scope.submitFullColor = function(){
      $scope.notti.fullColorChange([9,8,$scope.notti.redStart,$scope.notti.redEnd,$scope.notti.greenStart,$scope.notti.greenEnd, $scope.notti.blueStart,$scope.notti.blueEnd]);
    };

    $scope.connectClick = function () {
      $scope.notti.onSuccess('Connecting ....');
      notti.connect().then(function () {
        return $scope.disable = false, $scope.notti.toggleNottiLight(true), $scope.notti.isOn = true, $scope.$apply();
      }).catch(function (error) {
        console.error('Argh!', error);
      });
    }

    if (navigator.bluetooth == undefined) {
        console.log("No navigator.bluetooth found.");
        $scope.notti.onError("No navigator.bluetooth found.");
    } else if (navigator.bluetooth.referringDevice) {
        $scope.connectClick();
    }
});