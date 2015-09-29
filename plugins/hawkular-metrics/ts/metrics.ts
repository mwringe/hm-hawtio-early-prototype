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

    // The token used to authentication against the server with
    $scope.token = "";

    // The host containing running hawkular metrics
    $scope.endpoint = "http://172.30.11.68/hawkular/metrics";

    // Store the tenants which are available
    $scope.tenants = [];

    // The currently selected tenant
    $scope.tenant = "";

    // The currently seleted pod
    $scope.pod = {};

    $scope.host= "";

    // Stores the metrics object
    $scope.metrics = {};

    // The currently selected metric
    $scope.metric = {};

    $scope.timeRange = 30;

    $scope.timeOffset = 0;

    $scope.buckets = 60;

    // The currently selected contianer
    $scope.container = {};

    // The data for the currently selected chart
    $scope.chartData = {};

    $scope.counter_type = "rate";

    $scope.getTenants = function() {

      console.log("About to request tenants using token " + this.token);

      this.host = "";
      this.container = "";
      this.pod = {};
      this.metric = {};
      this.tenants = [];
      this.tenant = "";

      var metrics = this;

      var req = {
        method: 'GET',
        url: this.endpoint + "/tenants",
        headers: {
          'Accept': "application/json",
          'Hawkular-Tenant': "_system",
          'Authorization': "Bearer " + this.token
        }
      };

      $http(req).success(function(data, status, headers, config) {

        metrics.tenants = new Array();

        console.log("tenants response " + data);

        for (var i = 0; i < data.length; i++) {
          console.log("Tenant " + data[i].id);
          metrics.tenants.push(data[i].id);
        }

      }).error(function(data, status, headers, config) {
        //alert("ERROR : " + data);
        console.error('Error getting Metrics: ' + data);
      });

    };

    $scope.getMetrics = function() {

      console.log("About to request metrics using token " + this.token);

      this.host = "";
      this.container = "";
      this.pod = {};
      this.metric = {};

      var metrics = this;

      var req = {
        method: 'GET',
        url: this.endpoint + "/metrics",
        headers: {
          'Accept': "application/json",
          'Hawkular-Tenant': this.tenant,
          'Authorization': "Bearer " + this.token
        }
      };

      $http(req).success(function(data, status, headers, config) {

        console.log("metrics response " + data);

        metrics.metrics = data;

      }).error(function(data, status, headers, config) {
        //alert("ERROR : " + data);
        console.error('Error getting Metrics: ' + data);
      });

    };

    $scope.getChartData = function() {
      console.log("GETTING CHART DATA FOR " + this.metric.id);

      var metrics = this;

      metrics.chartData = {};

      var type;
      if (metrics.metric.type === "counter") {
        type = "counters";
      } else {
        type = "gauges";
      }

      var url = this.endpoint + "/" + type + "/" + encodeURIComponent(metrics.metric.id);

      if (metrics.metric.type === "counter") {
        url += "/" + this.counter_type;
      } else {
        url += "/data";
      }

      var endTime = new Date().getTime() - (this.timeOffset * 60000);
      var startTime = endTime - (this.timeRange * 60000);

      url += "?start=" + startTime;
      url += "&end=" + endTime;
      url += "&buckets=" + this.buckets;

      console.log ("URL " + url);

      var req = {
        method: 'GET',
        url: url,
        headers: {
          'Accept': "application/json",
          'Hawkular-Tenant': this.tenant,
          'Authorization': "Bearer " + this.token
        }
      };

      $http(req).success(function(data, status, headers, config) {

        console.log("data response " + data);

        var length = data.length;
        for (var i = 0; i < length; i++) {
          //console.log(data[i]);
          var point = data[i];

          if (point.timestamp == null) {
            var midTime = point.start + (point.end - point.start) / 2;
            point.timestamp = midTime;
          }

          if (point.value === "NaN") {
            data[i].value = 0;
          }

          if (point.avg == null) {
            point.avg = point.value;
            point.min = point.value;
            point.max = point.value;
            point.median = point.value;
          }

        }

        metrics.chartData = data;

      }).error(function(data, status, headers, config) {
        //alert("ERROR : " + data);
        console.error('Error getting Metrics: ' + data);
      });

    };

  }]);

}
