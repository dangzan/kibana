define(function (require) {
  var _ = require('lodash');
  var $ = require('jquery');
  var ConfigTemplate = require('utils/config_template');

  require('css!./styles/main.css');
  require('directives/config');
  require('courier/courier');
  require('config/config');
  require('notify/notify');


  require('./directives/grid');
  require('./directives/panel');
  require('./services/saved_dashboards');

  var app = require('modules').get('app/dashboard', [
    'elasticsearch',
    'ngRoute',
    'kibana/courier',
    'kibana/config',
    'kibana/notify',
    'kibana/services'
  ]);

  require('routes')
  .when('/dashboard', {
    templateUrl: 'kibana/apps/dashboard/index.html',
    resolve: {
      dash: function (savedDashboards) {
        return savedDashboards.get();
      }
    }
  })
  .when('/dashboard/:id', {
    templateUrl: 'kibana/apps/dashboard/index.html',
    resolve: {
      dash: function (savedDashboards, $route) {
        return savedDashboards.get($route.current.params.id);
      }
    }
  });

  app.directive('dashboardApp', function (Notifier, courier, savedVisualizations, AppState, timefilter) {
    return {
      controller: function ($scope, $route, $routeParams, $location, configFile) {
        var notify = new Notifier({
          location: 'Dashboard'
        });

        timefilter.enabled(true);

        var dash = $scope.dash = $route.current.locals.dash;

        var stateDefaults = {
          title: dash.title,
          panels: dash.panelsJSON ? JSON.parse(dash.panelsJSON) : []
        };

        var $state = $scope.$state = new AppState(stateDefaults);

        $scope.$on('$destroy', dash.destroy);

        $scope.configTemplate = new ConfigTemplate({
          save: require('text!./partials/save_dashboard.html'),
          load: require('text!./partials/load_dashboard.html'),
          pickVis: require('text!./partials/pick_visualization.html')
        });

        $scope.openSave = _.partial($scope.configTemplate.toggle, 'save');
        $scope.openLoad = _.partial($scope.configTemplate.toggle, 'load');
        $scope.openAdd = _.partial($scope.configTemplate.toggle, 'pickVis');
        $scope.refresh = _.bindKey(courier, 'fetch');

        $scope.save = function () {
          dash.title = $state.title;
          dash.panelsJSON = JSON.stringify($state.panels);

          dash.save()
          .then(function () {
            notify.info('Saved Dashboard as "' + $state.title + '"');
            if ($state.title !== $routeParams.id) {
              $location.url('/dashboard/' + encodeURIComponent($state.title));
            }
          })
          .catch(notify.fatal);
        };

        var pendingVis = 0;
        $scope.$on('ready:vis', function () {
          if (pendingVis) pendingVis--;
          if (pendingVis === 0) {
            $state.commit();
            courier.fetch();
          }
        });

        // listen for notifications from the grid component that changes have
        // been made, rather than watching the panels deeply
        $scope.$on('change:vis', function () {
          $state.commit();
        });

        // called by the saved-object-finder when a user clicks a vis
        $scope.addVis = function (hit) {
          pendingVis++;
          $state.panels.push({ visId: hit.id });
        };

        // Setup configurable values for config directive, after objects are initialized
        $scope.opts = {
          dashboard: dash,
          save: $scope.save,
          addVis: $scope.addVis
        };

        $scope.$broadcast('application.load');
      }
    };
  });
});