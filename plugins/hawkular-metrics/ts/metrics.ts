/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.

/// <reference path="metricsPlugin.ts"/>
module Metrics {

  export var MetricsController = _module.controller("HawkularMetrics.MetricsController", ["$scope", "$http", ($scope, $http) => {
    $scope.target = "World!";

    $scope.connected = false;

    $scope.tenants = {};

    $scope.metrics = {};

    $scope.host = "http://172.30.67.250/hawkular/metrics/metrics";

    $scope.baseMetricsURL = "http://172.30.67.250/hawkular/metrics";

    $scope.tenantId = "heapster";

    $scope.connect = function(url) {

      //alert("URL : " + url);

      var req = {
        method: 'GET',
        url: url,
        headers: {
          'Accept': "application/json",
          'Hawkular-Tenant': this.tenantId
        }
      };

      var metrics = this;

      $http(req).success(function(data, status, headers, config) {

        //alert("GOT BACK :" + data);
        metrics.metrics = data;
        //metrics.tenants = { foo: 'baz'};

      }).error(function(data, status, headers, config) {
        alert("ERROR : " + data);
      });
    };
  }]);

}
