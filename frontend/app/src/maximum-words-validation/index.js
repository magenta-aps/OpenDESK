angular.module('maximumWordsValidation', [])
  // Counts number of words in field and sets validity if more than max
  //
  // Usage:
  //   <input maximum-words-validation="100"/>
  // Example:
  //   <textarea ng-model="myModel.description" maximum-words-validation="100"></textarea>
  //   <span>{{myModel_description_words_count}} / 100 words</span>
  //
  // It will also set the {{fieldName}}_word_count variable on parent scope
  .directive('maximumWordsValidation', function () {
    'use strict';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        // Figure out name of count variable we will set on parent scope
        var wordCountName = attrs.ngModel.replace('.', '_') + '_words_count';

        scope.$watch(function () {
          return ngModelCtrl.$modelValue;
        }, function (newValue) {
          var str = newValue && newValue.replace('\n', '');
          // Dont split when string is empty, else count becomes 1
          var wordCount = str ? str.split(' ').length : 0;
          // Set count variable
          scope.$parent[wordCountName] = wordCount;
          // Update validity
          var max = attrs.maximumWordsValidation;
          ngModelCtrl.$setValidity('maximumWords', wordCount <= max);
        });
      }
    };
  });