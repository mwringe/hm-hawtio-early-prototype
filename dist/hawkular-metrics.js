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
/// <reference path="../libs/hawtio-utilities/defs.d.ts"/>

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
var Metrics;
(function (Metrics) {
    Metrics.pluginName = "hawtio-assembly";
    Metrics.log = Logger.get(Metrics.pluginName);
    Metrics.templatePath = "plugins/hawkular-metrics/html";
})(Metrics || (Metrics = {}));

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
var Metrics;
(function (Metrics) {
    Metrics._module = angular.module(Metrics.pluginName, ['hawkular.charts']);
    var tab = undefined;
    Metrics._module.config(["$locationProvider", "$routeProvider", "HawtioNavBuilderProvider",
        function ($locationProvider, $routeProvider, builder) {
            tab = builder.create()
                .id(Metrics.pluginName)
                .title(function () { return "Metrics"; })
                .href(function () { return "/metrics"; })
                .subPath("Container", "metrics", builder.join(Metrics.templatePath, "metrics.html"))
                .build();
            builder.configureRouting($routeProvider, tab);
            $locationProvider.html5Mode(true);
        }]);
    Metrics._module.filter('urlEncode', function () {
        return function (input) {
            if (input) {
                return encodeURIComponent(input);
            }
            else {
                return "";
            }
        };
    });
    Metrics._module.filter('namespaces', function () {
        return function (input) {
            var namespaces = new Array();
            if (input != null) {
                for (var i = 0; i < input.length; i++) {
                    if (input[i] != null && input[i].tags != null) {
                        var namespace = input[i].tags["pod_namespace"];
                        if (namespaces.indexOf(namespace) < 0) {
                            namespaces.push(namespace);
                        }
                    }
                }
            }
            return namespaces;
        };
    });
    Metrics._module.filter('namespace', function () {
        return function (input, namespaceName) {
            var metrics = new Array();
            if (input != null) {
                for (var i = 0; i < input.length; i++) {
                    if (input[i] != null && input[i].tags != null) {
                        var namespace = input[i].tags["pod_namespace"];
                        if (namespace === namespaceName) {
                            metrics.push(input[i]);
                        }
                    }
                }
            }
            return metrics;
        };
    });
    Metrics._module.filter('tags', function () {
        return function (input, tagName) {
            var tags = new Array();
            if (input != null) {
                for (var i = 0; i < input.length; i++) {
                    if (input[i] != null && input[i].tags != null) {
                        var namespace = input[i].tags[tagName];
                        if (tags.indexOf(namespace) < 0) {
                            tags.push(namespace);
                        }
                    }
                }
            }
            return tags;
        };
    });
    Metrics._module.filter('tag', function () {
        return function (input, tagName, tagValue) {
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
    Metrics._module.run(["HawtioNav", function (HawtioNav) {
            HawtioNav.add(tab);
            Metrics.log.debug("loaded");
        }]);
    hawtioPluginLoader.addModule(Metrics.pluginName);
})(Metrics || (Metrics = {}));

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
var Metrics;
(function (Metrics) {
    Metrics.MetricsController = Metrics._module.controller("HawkularMetrics.MetricsController", ["$scope", "$http", function ($scope, $http) {
            $scope.target = "World!";
            $scope.connected = false;
            $scope.tenants = {};
            $scope.metrics = {};
            $scope.host = "http://172.30.67.250/hawkular/metrics/metrics";
            $scope.baseMetricsURL = "http://172.30.67.250/hawkular/metrics";
            $scope.tenantId = "heapster";
            $scope.connect = function (url) {
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
                $http(req).success(function (data, status, headers, config) {
                    metrics.metrics = data;
                }).error(function (data, status, headers, config) {
                    alert("ERROR : " + data);
                });
            };
        }]);
})(Metrics || (Metrics = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwiaGF3a3VsYXItbWV0cmljcy90cy9tZXRyaWNzR2xvYmFscy50cyIsImhhd2t1bGFyLW1ldHJpY3MvdHMvbWV0cmljc1BsdWdpbi50cyIsImhhd2t1bGFyLW1ldHJpY3MvdHMvbWV0cmljcy50cyJdLCJuYW1lcyI6WyJNZXRyaWNzIl0sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyxBQUNBLHlDQUR5QztBQUN6QyxJQUFPLE9BQU8sQ0FPYjtBQVBELFdBQU8sT0FBTyxFQUFDLENBQUM7SUFFSEEsa0JBQVVBLEdBQUdBLGlCQUFpQkEsQ0FBQ0E7SUFFL0JBLFdBQUdBLEdBQW1CQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxrQkFBVUEsQ0FBQ0EsQ0FBQ0E7SUFFN0NBLG9CQUFZQSxHQUFHQSwrQkFBK0JBLENBQUNBO0FBQzVEQSxDQUFDQSxFQVBNLE9BQU8sS0FBUCxPQUFPLFFBT2I7O0FDdkJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2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IENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9saWJzL2hhd3Rpby11dGlsaXRpZXMvZGVmcy5kLnRzXCIvPlxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbm1vZHVsZSBNZXRyaWNzIHtcblxuICBleHBvcnQgdmFyIHBsdWdpbk5hbWUgPSBcImhhd3Rpby1hc3NlbWJseVwiO1xuXG4gIGV4cG9ydCB2YXIgbG9nOiBMb2dnaW5nLkxvZ2dlciA9IExvZ2dlci5nZXQocGx1Z2luTmFtZSk7XG5cbiAgZXhwb3J0IHZhciB0ZW1wbGF0ZVBhdGggPSBcInBsdWdpbnMvaGF3a3VsYXItbWV0cmljcy9odG1sXCI7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1ldHJpY3NHbG9iYWxzLnRzXCIvPlxubW9kdWxlIE1ldHJpY3Mge1xuXG4gIGV4cG9ydCB2YXIgX21vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKE1ldHJpY3MucGx1Z2luTmFtZSwgWydoYXdrdWxhci5jaGFydHMnXSk7XG5cbiAgdmFyIHRhYiA9IHVuZGVmaW5lZDtcblxuICBfbW9kdWxlLmNvbmZpZyhbXCIkbG9jYXRpb25Qcm92aWRlclwiLCBcIiRyb3V0ZVByb3ZpZGVyXCIsIFwiSGF3dGlvTmF2QnVpbGRlclByb3ZpZGVyXCIsXG4gICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXIsIGJ1aWxkZXI6IEhhd3Rpb01haW5OYXYuQnVpbGRlckZhY3RvcnkpID0+IHtcbiAgICB0YWIgPSBidWlsZGVyLmNyZWF0ZSgpXG4gICAgICAuaWQoTWV0cmljcy5wbHVnaW5OYW1lKVxuICAgICAgLnRpdGxlKCgpID0+IFwiTWV0cmljc1wiKVxuICAgICAgLmhyZWYoKCkgPT4gXCIvbWV0cmljc1wiKVxuICAgICAgLnN1YlBhdGgoXCJDb250YWluZXJcIiwgXCJtZXRyaWNzXCIsIGJ1aWxkZXIuam9pbihNZXRyaWNzLnRlbXBsYXRlUGF0aCwgXCJtZXRyaWNzLmh0bWxcIikpXG4gICAgICAuYnVpbGQoKTtcbiAgICBidWlsZGVyLmNvbmZpZ3VyZVJvdXRpbmcoJHJvdXRlUHJvdmlkZXIsIHRhYik7XG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICB9XSk7XG5cbiAgX21vZHVsZS5maWx0ZXIoJ3VybEVuY29kZScsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9O1xuICB9KTtcblxuICBfbW9kdWxlLmZpbHRlcignbmFtZXNwYWNlcycsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgdmFyIG5hbWVzcGFjZXMgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJpIDogXCIgKyBpICsgaW5wdXRbaV0uaWQpO1xuICAgICAgICBpZiAoaW5wdXRbaV0gIT0gbnVsbCAmJiBpbnB1dFtpXS50YWdzICE9IG51bGwpIHtcbiAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gaW5wdXRbaV0udGFnc1tcInBvZF9uYW1lc3BhY2VcIl07XG4gICAgICAgICAgaWYgKG5hbWVzcGFjZXMuaW5kZXhPZihuYW1lc3BhY2UpIDwgMCkge1xuICAgICAgICAgICAgbmFtZXNwYWNlcy5wdXNoKG5hbWVzcGFjZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIH1cbiAgICAgIHJldHVybiBuYW1lc3BhY2VzO1xuICAgIH07XG4gIH0pO1xuXG4gIF9tb2R1bGUuZmlsdGVyKCduYW1lc3BhY2UnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIG5hbWVzcGFjZU5hbWUpIHtcbiAgICAgIHZhciBtZXRyaWNzID0gbmV3IEFycmF5KCk7XG4gICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGlucHV0W2ldICE9IG51bGwgJiYgaW5wdXRbaV0udGFncyAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gaW5wdXRbaV0udGFnc1tcInBvZF9uYW1lc3BhY2VcIl07XG4gICAgICAgICAgICBpZiAobmFtZXNwYWNlID09PSBuYW1lc3BhY2VOYW1lKSB7XG4gICAgICAgICAgICAgIG1ldHJpY3MucHVzaChpbnB1dFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIHJldHVybiBtZXRyaWNzO1xuICAgIH07XG4gIH0pO1xuXG4gIF9tb2R1bGUuZmlsdGVyKCd0YWdzJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCB0YWdOYW1lKSB7XG4gICAgICB2YXIgdGFncyA9IG5ldyBBcnJheSgpO1xuICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coXCJpIDogXCIgKyBpICsgaW5wdXRbaV0uaWQpO1xuICAgICAgICAgIGlmIChpbnB1dFtpXSAhPSBudWxsICYmIGlucHV0W2ldLnRhZ3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGlucHV0W2ldLnRhZ3NbdGFnTmFtZV07XG4gICAgICAgICAgICBpZiAodGFncy5pbmRleE9mKG5hbWVzcGFjZSkgPCAwKSB7XG4gICAgICAgICAgICAgIHRhZ3MucHVzaChuYW1lc3BhY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICByZXR1cm4gdGFncztcbiAgICB9O1xuICB9KTtcblxuICBfbW9kdWxlLmZpbHRlcigndGFnJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCB0YWdOYW1lLCB0YWdWYWx1ZSkge1xuICAgICAgdmFyIG1ldHJpY3MgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaW5wdXRbaV0gIT0gbnVsbCAmJiBpbnB1dFtpXS50YWdzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciB0YWcgPSBpbnB1dFtpXS50YWdzW3RhZ05hbWVdO1xuICAgICAgICAgICAgaWYgKHRhZyA9PT0gdGFnVmFsdWUpIHtcbiAgICAgICAgICAgICAgbWV0cmljcy5wdXNoKGlucHV0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgcmV0dXJuIG1ldHJpY3M7XG4gICAgfTtcbiAgfSk7XG5cbiAgX21vZHVsZS5ydW4oW1wiSGF3dGlvTmF2XCIsIChIYXd0aW9OYXY6IEhhd3Rpb01haW5OYXYuUmVnaXN0cnkpID0+IHtcbiAgICBIYXd0aW9OYXYuYWRkKHRhYik7XG4gICAgbG9nLmRlYnVnKFwibG9hZGVkXCIpO1xuICB9XSk7XG5cblxuICBoYXd0aW9QbHVnaW5Mb2FkZXIuYWRkTW9kdWxlKE1ldHJpY3MucGx1Z2luTmFtZSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1ldHJpY3NQbHVnaW4udHNcIi8+XG5tb2R1bGUgTWV0cmljcyB7XG5cbiAgZXhwb3J0IHZhciBNZXRyaWNzQ29udHJvbGxlciA9IF9tb2R1bGUuY29udHJvbGxlcihcIkhhd2t1bGFyTWV0cmljcy5NZXRyaWNzQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkaHR0cFwiLCAoJHNjb3BlLCAkaHR0cCkgPT4ge1xuICAgICRzY29wZS50YXJnZXQgPSBcIldvcmxkIVwiO1xuXG4gICAgJHNjb3BlLmNvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLnRlbmFudHMgPSB7fTtcblxuICAgICRzY29wZS5tZXRyaWNzID0ge307XG5cbiAgICAkc2NvcGUuaG9zdCA9IFwiaHR0cDovLzE3Mi4zMC42Ny4yNTAvaGF3a3VsYXIvbWV0cmljcy9tZXRyaWNzXCI7XG5cbiAgICAkc2NvcGUuYmFzZU1ldHJpY3NVUkwgPSBcImh0dHA6Ly8xNzIuMzAuNjcuMjUwL2hhd2t1bGFyL21ldHJpY3NcIjtcblxuICAgICRzY29wZS50ZW5hbnRJZCA9IFwiaGVhcHN0ZXJcIjtcblxuICAgICRzY29wZS5jb25uZWN0ID0gZnVuY3Rpb24odXJsKSB7XG5cbiAgICAgIC8vYWxlcnQoXCJVUkwgOiBcIiArIHVybCk7XG5cbiAgICAgIHZhciByZXEgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0FjY2VwdCc6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICdIYXdrdWxhci1UZW5hbnQnOiB0aGlzLnRlbmFudElkXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHZhciBtZXRyaWNzID0gdGhpcztcblxuICAgICAgJGh0dHAocmVxKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG5cbiAgICAgICAgLy9hbGVydChcIkdPVCBCQUNLIDpcIiArIGRhdGEpO1xuICAgICAgICBtZXRyaWNzLm1ldHJpY3MgPSBkYXRhO1xuICAgICAgICAvL21ldHJpY3MudGVuYW50cyA9IHsgZm9vOiAnYmF6J307XG5cbiAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1IgOiBcIiArIGRhdGEpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfV0pO1xuXG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
angular.module("hawkular-metrics-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/hawkular-metrics/html/metrics.html","<div class=\"row\">\n  <div class=\"col-md-12\" ng-controller=\"HawkularMetrics.MetricsController\">\n    <h1>Container Metrics</h1>\n    <p>Metrics gathered from OpenShift</p>\n    <!--<p>Hello {{target}}</p>-->\n\n    <div>\n      <p ng-show=\"!connected\">Host <input ng-model=\"host\"/><button ng-click=\"connect(host)\">Connect</button></p>\n\n      <p>Tenant Id<select></select></p>\n      <p>Namespace\n        <select ng-model=\"mynamespace\" ng-options=\"value for value in metrics | tags:\'pod_namespace\'\"></select>\n      </p>\n      <p>Pod\n        <select ng-model=\"mypod\" ng-options=\"value for value in metrics | tags:\'pod_name\'\"></select>\n      </p>\n\n      <p>Metric<select ng-model=\"mymetric\" ng-options=\"foo.id for foo in metrics | namespace:mynamespace | tag:\'pod_name\':mypod\"></select></p>\n    </div>\n\n    <div class=\"chartWrapper\" style=\"height:300px\">\n      <hawkular-chart chart-type=\"hawkularmetric\"\n                      metric-id=\"{{mymetric.id | urlEncode}}\"\n                      metric-url=\"{{baseMetricsURL}}\"\n                      metric-tenant-id=\"{{tenantId}}\"\n                      metric-type=\"gauge\"\n                      time-range-in-seconds=\"7200\"\n                      refresh-interval-in-seconds=\"30\"\n                      show-avg-line=true\n                      y-axis-units=\"Memory Usage ({{mymetric.tags.units}})\"\n                      chart-height=\"250\">\n      </hawkular-chart>\n    </div>\n\n    <p>Namespaces: {{metrics | namespaces}}</p>\n    <p>Container Names: {{metrics | tags:\'container_name\'}}</p>\n    <p>Container Names: {{metrics | tags:\'pod_name\'}}</p>\n\n    <!--<div>-->\n      <!--<div ng-repeat=\"metric in metrics\">-->\n        <!--<p>ID : {{metric.id}}</p>-->\n        <!--<p>TAGS: {{metric.tags.pod_name}}</p>-->\n        <!--<p></p>-->\n        <!--<p></p>-->\n\n      <!--</div>-->\n    <!--</div>-->\n\n      <div>\n          <p>Metric ID: <em>{{mymetric.id}}</em></p>\n          <ul ng-repeat=\"(key, value) in mymetric.tags\">\n              <li>\n                  <span style=\"font-weight:bold\">{{key}}</span><span>  {{value}}</span>\n              </li>\n\n          </ul>\n\n      </div>\n\n\n\n    <pre>\n      host = {{host}}\n      <!--tenants = {{tenants}}-->\n      mymetric = {{mymetric}}\n      <!--descriptor = {{mymetric.tags.descriptor_name}} - {{mymetric.tags.units}}-->\n      <!--metrics = {{metrics}}-->\n    </pre>\n\n  </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawkular-metrics-templates");