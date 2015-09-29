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

/// <reference path="../../includes.ts"/>
/// <reference path="metricsGlobals.ts"/>
module Metrics {

  export var _module = angular.module(Metrics.pluginName, ['hawkular.charts']);

  var tab = undefined;

  _module.config(["$locationProvider", "$routeProvider", "HawtioNavBuilderProvider",
    ($locationProvider, $routeProvider: ng.route.IRouteProvider, builder: HawtioMainNav.BuilderFactory) => {
    tab = builder.create()
      .id(Metrics.pluginName)
      .title(() => "Metrics")
      .href(() => "/metrics")
      .subPath("Container", "metrics", builder.join(Metrics.templatePath, "metrics.html"))
      .build();
    builder.configureRouting($routeProvider, tab);
    $locationProvider.html5Mode(true);
  }]);

  _module.filter('urlEncode', function() {
      return function(input) {
        if (input) {
          return encodeURIComponent(input);
        } else {
          return "";
        }
      };
  });

  _module.filter('tags', function() {
    return function(input, tagName) {
      var tags = new Array();
      if (input != null) {
        for (var i = 0; i < input.length; i++) {
          //console.log("i : " + i + input[i].id);
          if (input[i] != null && input[i].tags != null) {
            var namespace = input[i].tags[tagName];
            if (namespace != null && tags.indexOf(namespace) < 0) {
              tags.push(namespace);
            }
          }
        }

      }
      return tags;
    };
  });

  _module.filter('tag', function() {
    return function(input, tagName, tagValue) {
      var metrics = new Array();
      if (input != null) {
        for (var i = 0; i < input.length; i++) {
          if (input[i] != null && input[i].tags != null) {
            var tag = input[i].tags[tagName];
            if (tag === tagValue) {
              metrics.push(input[i]);
            }
          }
        }

      }
      return metrics;
    };
  });

  _module.run(["HawtioNav", (HawtioNav: HawtioMainNav.Registry) => {
    HawtioNav.add(tab);
    log.debug("loaded");
  }]);


  hawtioPluginLoader.addModule(Metrics.pluginName);
}
