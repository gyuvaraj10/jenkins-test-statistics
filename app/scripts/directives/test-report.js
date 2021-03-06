'use strict';

/**
 * @ngdoc directive
 * @name testReporterApp.directive:passRate
 * @description
 * # passRate
 */
angular.module('testReporterApp')
  .directive('testReport', ['NgTableParams', 'FileSaver','SolrSearch', function (NgTableParams, FileSaver, SolrSearch) {
    return {
      templateUrl: '/views/directives/test-report.html',
      restrict: 'A',
      scope: {
        testReport: '=',
        testReportSummary: '='
      },
      link: function ($scope) {
        $scope.$watch('testReport', function (testReport) {
          if (!testReport) {
            return;
          }

          var testStatuses = testReport.cases.map(function (tc) {
            return tc.status;
          });
          $scope.testStatuses = testStatuses.filter(function (el, index) {
            return testStatuses.indexOf(el) === index;
          });

          $scope.testTableParameters = new NgTableParams({
              count: 25,
              sorting: {
                'getPassRate()': 'asc'
              }
            },
            {
              dataset: testReport.cases
            });

        });

        $scope.showError = function (execution) {
          execution.showException = true;

          SolrSearch.getSimilarDocuments(execution).then(function (response) {
            var dcs = [];
            response.data.response.docs.forEach(function (doc) {

              dcs.push($scope.testReport.getExecution(doc.id));
            });

            $scope.testNames = dcs;
          });
        };

        $scope.exportCsv = function () {
          var tcs = $scope.testReport.cases.map(function (tc) {
            return [
              tc.job.name,
              tc.className,
              tc.name,
              tc.executions.length,
              tc.passingCount,
              tc.getPassRate(),
              tc.url
            ].map(function (item) {
              return '"' + item + '"';
            }).join(",");
          }).join("\n");

          var header = "Job, Test Suite,Test Name,Number of testExecutions,Passing count,Pass rate,Jenkins Test history URL";
          var exportBlob = new Blob([header + "\n" + tcs], {type: 'text/csv'});
          FileSaver.saveAs(exportBlob, "TestReport.csv");
        };
      }
    };
  }]);
