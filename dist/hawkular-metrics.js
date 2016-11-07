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
    Metrics._module.filter('tags', function () {
        return function (input, tagName) {
            var tags = new Array();
            if (input != null) {
                for (var i = 0; i < input.length; i++) {
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
            $scope.token = "";
            $scope.endpoint = "https://hawkular-metrics.example.com/hawkular/metrics";
            $scope.tenants = [];
            $scope.tenant = "";
            $scope.pod = {};
            $scope.host = "";
            $scope.metrics = {};
            $scope.metric = {};
            $scope.timeRange = 30;
            $scope.timeOffset = 0;
            $scope.buckets = 60;
            $scope.container = {};
            $scope.chartData = {};
            $scope.counter_type = "rate";
            $scope.getTenants = function () {
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
                $http(req).success(function (data, status, headers, config) {
                    metrics.tenants = new Array();
                    console.log("tenants response " + data);
                    for (var i = 0; i < data.length; i++) {
                        console.log("Tenant " + data[i].id);
                        metrics.tenants.push(data[i].id);
                    }
                }).error(function (data, status, headers, config) {
                    console.error('Error getting Metrics: ' + data);
                });
            };
            $scope.getMetrics = function () {
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
                $http(req).success(function (data, status, headers, config) {
                    console.log("metrics response " + data);
                    metrics.metrics = data;
                }).error(function (data, status, headers, config) {
                    console.error('Error getting Metrics: ' + data);
                });
            };
            $scope.getChartData = function () {
                console.log("GETTING CHART DATA FOR " + this.metric.id);
                var metrics = this;
                metrics.chartData = {};
                var type;
                if (metrics.metric.type === "counter") {
                    type = "counters";
                }
                else {
                    type = "gauges";
                }
                var url = this.endpoint + "/" + type + "/" + encodeURIComponent(metrics.metric.id);
                if (metrics.metric.type === "counter") {
                    url += "/" + this.counter_type;
                }
                else {
                    url += "/data";
                }
                var endTime = new Date().getTime() - (this.timeOffset * 60000);
                var startTime = endTime - (this.timeRange * 60000);
                url += "?start=" + startTime;
                url += "&end=" + endTime;
                url += "&buckets=" + this.buckets;
                console.log("URL " + url);
                var req = {
                    method: 'GET',
                    url: url,
                    headers: {
                        'Accept': "application/json",
                        'Hawkular-Tenant': this.tenant,
                        'Authorization': "Bearer " + this.token
                    }
                };
                $http(req).success(function (data, status, headers, config) {
                    //console.log("data response " + data);
                    var length = data.length;
                    for (var i = 0; i < length; i++) {
                        console.log(data[i]);
                        var point = data[i];
                        if (point.timestamp == null) {
                            var midTime = point.start + (point.end - point.start) / 2;
                            point.timestamp = midTime;
                        }
                    }
                    metrics.chartData = data;
                }).error(function (data, status, headers, config) {
                    console.error('Error getting Metrics: ' + data);
                });
            };
        }]);
})(Metrics || (Metrics = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwiaGF3a3VsYXItbWV0cmljcy90cy9tZXRyaWNzR2xvYmFscy50cyIsImhhd2t1bGFyLW1ldHJpY3MvdHMvbWV0cmljc1BsdWdpbi50cyIsImhhd2t1bGFyLW1ldHJpY3MvdHMvbWV0cmljcy50cyJdLCJuYW1lcyI6WyJNZXRyaWNzIl0sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyxBQUNBLHlDQUR5QztBQUN6QyxJQUFPLE9BQU8sQ0FPYjtBQVBELFdBQU8sT0FBTyxFQUFDLENBQUM7SUFFSEEsa0JBQVVBLEdBQUdBLGlCQUFpQkEsQ0FBQ0E7SUFFL0JBLFdBQUdBLEdBQW1CQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxrQkFBVUEsQ0FBQ0EsQ0FBQ0E7SUFFN0NBLG9CQUFZQSxHQUFHQSwrQkFBK0JBLENBQUNBO0FBQzVEQSxDQUFDQSxFQVBNLE9BQU8sS0FBUCxPQUFPLFFBT2I7O0FDdkJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2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QUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUdwQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQzVCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQzFELEtBQUssQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO3dCQUM1QixDQUFDO29CQUVILENBQUM7b0JBRUQsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBRTNCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFTLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU07b0JBRTdDLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELENBQUMsQ0FBQyxDQUFDO1lBRUwsQ0FBQyxDQUFDQTtRQUVKQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUVOQSxDQUFDQSxFQXpMTSxPQUFPLEtBQVAsT0FBTyxRQXlMYiIsImZpbGUiOiJjb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vbGlicy9oYXd0aW8tdXRpbGl0aWVzL2RlZnMuZC50c1wiLz5cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG5tb2R1bGUgTWV0cmljcyB7XG5cbiAgZXhwb3J0IHZhciBwbHVnaW5OYW1lID0gXCJoYXd0aW8tYXNzZW1ibHlcIjtcblxuICBleHBvcnQgdmFyIGxvZzogTG9nZ2luZy5Mb2dnZXIgPSBMb2dnZXIuZ2V0KHBsdWdpbk5hbWUpO1xuXG4gIGV4cG9ydCB2YXIgdGVtcGxhdGVQYXRoID0gXCJwbHVnaW5zL2hhd2t1bGFyLW1ldHJpY3MvaHRtbFwiO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJtZXRyaWNzR2xvYmFscy50c1wiLz5cbm1vZHVsZSBNZXRyaWNzIHtcblxuICBleHBvcnQgdmFyIF9tb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShNZXRyaWNzLnBsdWdpbk5hbWUsIFsnaGF3a3VsYXIuY2hhcnRzJ10pO1xuXG4gIHZhciB0YWIgPSB1bmRlZmluZWQ7XG5cbiAgX21vZHVsZS5jb25maWcoW1wiJGxvY2F0aW9uUHJvdmlkZXJcIiwgXCIkcm91dGVQcm92aWRlclwiLCBcIkhhd3Rpb05hdkJ1aWxkZXJQcm92aWRlclwiLFxuICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyLCBidWlsZGVyOiBIYXd0aW9NYWluTmF2LkJ1aWxkZXJGYWN0b3J5KSA9PiB7XG4gICAgdGFiID0gYnVpbGRlci5jcmVhdGUoKVxuICAgICAgLmlkKE1ldHJpY3MucGx1Z2luTmFtZSlcbiAgICAgIC50aXRsZSgoKSA9PiBcIk1ldHJpY3NcIilcbiAgICAgIC5ocmVmKCgpID0+IFwiL21ldHJpY3NcIilcbiAgICAgIC5zdWJQYXRoKFwiQ29udGFpbmVyXCIsIFwibWV0cmljc1wiLCBidWlsZGVyLmpvaW4oTWV0cmljcy50ZW1wbGF0ZVBhdGgsIFwibWV0cmljcy5odG1sXCIpKVxuICAgICAgLmJ1aWxkKCk7XG4gICAgYnVpbGRlci5jb25maWd1cmVSb3V0aW5nKCRyb3V0ZVByb3ZpZGVyLCB0YWIpO1xuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgfV0pO1xuXG4gIF9tb2R1bGUuZmlsdGVyKCd1cmxFbmNvZGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgfSk7XG5cbiAgX21vZHVsZS5maWx0ZXIoJ3RhZ3MnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIHRhZ05hbWUpIHtcbiAgICAgIHZhciB0YWdzID0gbmV3IEFycmF5KCk7XG4gICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhcImkgOiBcIiArIGkgKyBpbnB1dFtpXS5pZCk7XG4gICAgICAgICAgaWYgKGlucHV0W2ldICE9IG51bGwgJiYgaW5wdXRbaV0udGFncyAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gaW5wdXRbaV0udGFnc1t0YWdOYW1lXTtcbiAgICAgICAgICAgIGlmIChuYW1lc3BhY2UgIT0gbnVsbCAmJiB0YWdzLmluZGV4T2YobmFtZXNwYWNlKSA8IDApIHtcbiAgICAgICAgICAgICAgdGFncy5wdXNoKG5hbWVzcGFjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIHJldHVybiB0YWdzO1xuICAgIH07XG4gIH0pO1xuXG4gIF9tb2R1bGUuZmlsdGVyKCd0YWcnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIHRhZ05hbWUsIHRhZ1ZhbHVlKSB7XG4gICAgICB2YXIgbWV0cmljcyA9IG5ldyBBcnJheSgpO1xuICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChpbnB1dFtpXSAhPSBudWxsICYmIGlucHV0W2ldLnRhZ3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHRhZyA9IGlucHV0W2ldLnRhZ3NbdGFnTmFtZV07XG4gICAgICAgICAgICBpZiAodGFnID09PSB0YWdWYWx1ZSkge1xuICAgICAgICAgICAgICBtZXRyaWNzLnB1c2goaW5wdXRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICByZXR1cm4gbWV0cmljcztcbiAgICB9O1xuICB9KTtcblxuICBfbW9kdWxlLnJ1bihbXCJIYXd0aW9OYXZcIiwgKEhhd3Rpb05hdjogSGF3dGlvTWFpbk5hdi5SZWdpc3RyeSkgPT4ge1xuICAgIEhhd3Rpb05hdi5hZGQodGFiKTtcbiAgICBsb2cuZGVidWcoXCJsb2FkZWRcIik7XG4gIH1dKTtcblxuXG4gIGhhd3Rpb1BsdWdpbkxvYWRlci5hZGRNb2R1bGUoTWV0cmljcy5wbHVnaW5OYW1lKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWV0cmljc1BsdWdpbi50c1wiLz5cbm1vZHVsZSBNZXRyaWNzIHtcblxuICBleHBvcnQgdmFyIE1ldHJpY3NDb250cm9sbGVyID0gX21vZHVsZS5jb250cm9sbGVyKFwiSGF3a3VsYXJNZXRyaWNzLk1ldHJpY3NDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRodHRwXCIsICgkc2NvcGUsICRodHRwKSA9PiB7XG5cbiAgICAvLyBUaGUgdG9rZW4gdXNlZCB0byBhdXRoZW50aWNhdGlvbiBhZ2FpbnN0IHRoZSBzZXJ2ZXIgd2l0aFxuICAgICRzY29wZS50b2tlbiA9IFwiXCI7XG5cbiAgICAvLyBUaGUgaG9zdCBjb250YWluaW5nIHJ1bm5pbmcgaGF3a3VsYXIgbWV0cmljc1xuICAgICRzY29wZS5lbmRwb2ludCA9IFwiaHR0cHM6Ly9oYXdrdWxhci1tZXRyaWNzLmV4YW1wbGUuY29tL2hhd2t1bGFyL21ldHJpY3NcIjtcblxuICAgIC8vIFN0b3JlIHRoZSB0ZW5hbnRzIHdoaWNoIGFyZSBhdmFpbGFibGVcbiAgICAkc2NvcGUudGVuYW50cyA9IFtdO1xuXG4gICAgLy8gVGhlIGN1cnJlbnRseSBzZWxlY3RlZCB0ZW5hbnRcbiAgICAkc2NvcGUudGVuYW50ID0gXCJcIjtcblxuICAgIC8vIFRoZSBjdXJyZW50bHkgc2VsZXRlZCBwb2RcbiAgICAkc2NvcGUucG9kID0ge307XG5cbiAgICAkc2NvcGUuaG9zdD0gXCJcIjtcblxuICAgIC8vIFN0b3JlcyB0aGUgbWV0cmljcyBvYmplY3RcbiAgICAkc2NvcGUubWV0cmljcyA9IHt9O1xuXG4gICAgLy8gVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBtZXRyaWNcbiAgICAkc2NvcGUubWV0cmljID0ge307XG5cbiAgICAkc2NvcGUudGltZVJhbmdlID0gMzA7XG5cbiAgICAkc2NvcGUudGltZU9mZnNldCA9IDA7XG5cbiAgICAkc2NvcGUuYnVja2V0cyA9IDYwO1xuXG4gICAgLy8gVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjb250aWFuZXJcbiAgICAkc2NvcGUuY29udGFpbmVyID0ge307XG5cbiAgICAvLyBUaGUgZGF0YSBmb3IgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjaGFydFxuICAgICRzY29wZS5jaGFydERhdGEgPSB7fTtcblxuICAgICRzY29wZS5jb3VudGVyX3R5cGUgPSBcInJhdGVcIjtcblxuICAgICRzY29wZS5nZXRUZW5hbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gcmVxdWVzdCB0ZW5hbnRzIHVzaW5nIHRva2VuIFwiICsgdGhpcy50b2tlbik7XG5cbiAgICAgIHRoaXMuaG9zdCA9IFwiXCI7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IFwiXCI7XG4gICAgICB0aGlzLnBvZCA9IHt9O1xuICAgICAgdGhpcy5tZXRyaWMgPSB7fTtcbiAgICAgIHRoaXMudGVuYW50cyA9IFtdO1xuICAgICAgdGhpcy50ZW5hbnQgPSBcIlwiO1xuXG4gICAgICB2YXIgbWV0cmljcyA9IHRoaXM7XG5cbiAgICAgIHZhciByZXEgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogdGhpcy5lbmRwb2ludCArIFwiL3RlbmFudHNcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBY2NlcHQnOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAnSGF3a3VsYXItVGVuYW50JzogXCJfc3lzdGVtXCIsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBcIkJlYXJlciBcIiArIHRoaXMudG9rZW5cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJGh0dHAocmVxKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG5cbiAgICAgICAgbWV0cmljcy50ZW5hbnRzID0gbmV3IEFycmF5KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZW5hbnRzIHJlc3BvbnNlIFwiICsgZGF0YSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJUZW5hbnQgXCIgKyBkYXRhW2ldLmlkKTtcbiAgICAgICAgICBtZXRyaWNzLnRlbmFudHMucHVzaChkYXRhW2ldLmlkKTtcbiAgICAgICAgfVxuXG4gICAgICB9KS5lcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAvL2FsZXJ0KFwiRVJST1IgOiBcIiArIGRhdGEpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIE1ldHJpY3M6ICcgKyBkYXRhKTtcbiAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgICRzY29wZS5nZXRNZXRyaWNzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gcmVxdWVzdCBtZXRyaWNzIHVzaW5nIHRva2VuIFwiICsgdGhpcy50b2tlbik7XG5cbiAgICAgIHRoaXMuaG9zdCA9IFwiXCI7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IFwiXCI7XG4gICAgICB0aGlzLnBvZCA9IHt9O1xuICAgICAgdGhpcy5tZXRyaWMgPSB7fTtcblxuICAgICAgdmFyIG1ldHJpY3MgPSB0aGlzO1xuXG4gICAgICB2YXIgcmVxID0ge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB1cmw6IHRoaXMuZW5kcG9pbnQgKyBcIi9tZXRyaWNzXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQWNjZXB0JzogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgJ0hhd2t1bGFyLVRlbmFudCc6IHRoaXMudGVuYW50LFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJzogXCJCZWFyZXIgXCIgKyB0aGlzLnRva2VuXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRodHRwKHJlcSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwibWV0cmljcyByZXNwb25zZSBcIiArIGRhdGEpO1xuXG4gICAgICAgIG1ldHJpY3MubWV0cmljcyA9IGRhdGE7XG5cbiAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIC8vYWxlcnQoXCJFUlJPUiA6IFwiICsgZGF0YSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgTWV0cmljczogJyArIGRhdGEpO1xuICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldENoYXJ0RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coXCJHRVRUSU5HIENIQVJUIERBVEEgRk9SIFwiICsgdGhpcy5tZXRyaWMuaWQpO1xuXG4gICAgICB2YXIgbWV0cmljcyA9IHRoaXM7XG5cbiAgICAgIG1ldHJpY3MuY2hhcnREYXRhID0ge307XG5cbiAgICAgIHZhciB0eXBlO1xuICAgICAgaWYgKG1ldHJpY3MubWV0cmljLnR5cGUgPT09IFwiY291bnRlclwiKSB7XG4gICAgICAgIHR5cGUgPSBcImNvdW50ZXJzXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gXCJnYXVnZXNcIjtcbiAgICAgIH1cblxuICAgICAgdmFyIHVybCA9IHRoaXMuZW5kcG9pbnQgKyBcIi9cIiArIHR5cGUgKyBcIi9cIiArIGVuY29kZVVSSUNvbXBvbmVudChtZXRyaWNzLm1ldHJpYy5pZCk7XG5cbiAgICAgIGlmIChtZXRyaWNzLm1ldHJpYy50eXBlID09PSBcImNvdW50ZXJcIikge1xuICAgICAgICB1cmwgKz0gXCIvXCIgKyB0aGlzLmNvdW50ZXJfdHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybCArPSBcIi9kYXRhXCI7XG4gICAgICB9XG5cbiAgICAgIHZhciBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSAodGhpcy50aW1lT2Zmc2V0ICogNjAwMDApO1xuICAgICAgdmFyIHN0YXJ0VGltZSA9IGVuZFRpbWUgLSAodGhpcy50aW1lUmFuZ2UgKiA2MDAwMCk7XG5cbiAgICAgIHVybCArPSBcIj9zdGFydD1cIiArIHN0YXJ0VGltZTtcbiAgICAgIHVybCArPSBcIiZlbmQ9XCIgKyBlbmRUaW1lO1xuICAgICAgdXJsICs9IFwiJmJ1Y2tldHM9XCIgKyB0aGlzLmJ1Y2tldHM7XG5cbiAgICAgIGNvbnNvbGUubG9nIChcIlVSTCBcIiArIHVybCk7XG5cbiAgICAgIHZhciByZXEgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0FjY2VwdCc6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICdIYXdrdWxhci1UZW5hbnQnOiB0aGlzLnRlbmFudCxcbiAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IFwiQmVhcmVyIFwiICsgdGhpcy50b2tlblxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkaHR0cChyZXEpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiZGF0YSByZXNwb25zZSBcIiArIGRhdGEpO1xuXG4gICAgICAgIHZhciBsZW5ndGggPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFbaV0pO1xuICAgICAgICAgIHZhciBwb2ludCA9IGRhdGFbaV07XG5cbiAgICAgICAgICAvL1RPRE86IHJlbW92ZSBvbmNlIGh0dHBzOi8vaXNzdWVzLmpib3NzLm9yZy9icm93c2UvSEFXS1VMQVItNjQzIGlzIGRvbmUgYW5kIGluIGEgcmVsZWFzZWQgdmVyc2lvbi5cbiAgICAgICAgICBpZiAocG9pbnQudGltZXN0YW1wID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBtaWRUaW1lID0gcG9pbnQuc3RhcnQgKyAocG9pbnQuZW5kIC0gcG9pbnQuc3RhcnQpIC8gMjtcbiAgICAgICAgICAgIHBvaW50LnRpbWVzdGFtcCA9IG1pZFRpbWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBtZXRyaWNzLmNoYXJ0RGF0YSA9IGRhdGE7XG5cbiAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIC8vYWxlcnQoXCJFUlJPUiA6IFwiICsgZGF0YSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgTWV0cmljczogJyArIGRhdGEpO1xuICAgICAgfSk7XG5cbiAgICB9O1xuXG4gIH1dKTtcblxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
angular.module("hawkular-metrics-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/hawkular-metrics/html/metrics.html","<div class=\"row\">\n  <div class=\"col-md-12\" ng-controller=\"HawkularMetrics.MetricsController\">\n    <h1>Container Metrics</h1>\n    <p>Metrics gathered from OpenShift</p>\n\n    <div>\n\n      <p>Token\n        <input ng-model=\"token\"/></input>\n      </p>\n\n      <p>Endpoint\n        <input ng-model=\"endpoint\"/></input>\n        <button ng-click=\"getTenants()\">Connect</button>\n      </p>\n\n      <p ng-show=\"tenants.length > 0\">Tenants\n        <select ng-model=\"tenant\" ng-options=\"value for value in tenants\" ng-change=\"getMetrics()\"></select>\n      </p>\n\n      <!--<p ng-show=\"metrics.length > 0\">Container-->\n      <!--<select ng-model=\"metric\" ng-options=\"value.id for value in metrics | tag:tenant\" ng-change=\"getChartData()\"></select>-->\n      <!--</p>-->\n\n      <p ng-show=\"metrics.length > 0 && (metrics|tags:\'pod_name\').length > 0\">Pods\n        <select ng-model=\"pod\" ng-options=\"value for value in metrics | tags:\'pod_name\'\"></select>\n      </p>\n\n      <p ng-show=\"metrics.length > 0 && (metrics|tags:\'pod_name\').length == 0\">Host\n        <select ng-model=\"host\" ng-options=\"value for value in metrics | tags:\'hostname\'\"></select>\n      </p>\n\n      <p ng-show=\"pod.length > 0\">Container\n        <select ng-model=\"container\" ng-options=\"value for value in metrics | tag:tenant | tag:\'pod_name\':pod | tags:\'container_name\'\"></select>\n      </p>\n\n      <p ng-show=\"container.length > 0\">Metric\n        <select ng-model=\"metric\"\n                ng-change=\"getChartData()\"\n                ng-options=\"foo.tags.descriptor_name for foo in metrics | tag:tenant | tag:\'pod_name\':pod | tag:container\"></select>\n      </p>\n\n      <p ng-show=\"host.length > 0\">Metric\n        <select ng-model=\"metric\"\n                ng-change=\"getChartData()\"\n                ng-options=\"foo.id for foo in metrics | tag:tenant | tag:\'hostname\':host\"></select>\n      </p>\n\n      <p ng-show=\"metric.type == \'counter\'\">Counter Type:\n        <select ng-model=\"counter_type\"\n                ng-change=\"getChartData()\"\n                ng-options=\"type for type in [\'data\', \'rate\']\"\n                >\n        </select>\n      </p>\n\n\n      <p ng-show=\"metric.id != null\"> Time Offset: {{timeOffset}} minutes\n        <input\n            ng-model=\"timeOffset\"\n            ng-change=\"getChartData()\"\n            type=\"range\"\n            name=\"Time Range (minutes)\"\n            min=\"0\"\n            max=\"500\">\n        </input>\n      </p>\n\n\n      <p ng-show=\"metric.id != null\"> Time Range: {{timeRange}} minutes\n        <input\n            ng-model=\"timeRange\"\n            ng-change=\"getChartData()\"\n            type=\"range\"\n            name=\"Time Range (minutes)\"\n            min=\"1\"\n            max=\"240\">\n        </input>\n      </p>\n\n      <p ng-show=\"metric.id != null\"> Buckets: {{buckets}}\n        <input\n            ng-model=\"buckets\"\n            ng-change=\"getChartData()\"\n            type=\"range\"\n            name=\"Time Range (minutes)\"\n            min=\"1\"\n            max=\"500\">\n        </input>\n      </p>\n\n      <div ng-if=\"metric.id != null\">\n        <div class=\"chartWrapper\" style=\"height:300px\">\n          <hawkular-chart chart-type=\"hawkularmetric\"\n                          data=\"{{chartData}}\"\n                          show-avg-line=true\n                          y-axis-units=\"Memory Usage ({{mymetric.tags.units}})\"\n                          chart-height=\"250\">\n          </hawkular-chart>\n        </div>\n      </div>\n\n    </div>\n\n\n    <pre>\n      URL = {{url}}\n      Endpoint = {{endpoint}}\n      Token = {{token}}\n      Tenants = {{tenants}}\n      Pod = {{pod}}\n      Container = {{container}}\n      Metric:\n      {{metric | json}}\n    <!--mymetric = {{mymetric}}-->\n    <!--descriptor = {{mymetric.tags.descriptor_name}} - {{mymetric.tags.units}}-->\n    <!--metrics = {{metrics}}-->\n    </pre>\n  </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawkular-metrics-templates");