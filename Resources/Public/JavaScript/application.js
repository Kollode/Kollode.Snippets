/**
 * Created by Kollode on 20.06.14.
 */
'use strict';
var snippetApp = angular.module('kollodesnippet', []);
snippetApp.controller('snippetCategories', ['$scope', 'SnippetDb', function ($scope, snippetDb) {

	$scope.categories = []; //snippetDb.getCategories();
	$scope.subcategoryName = 'Subtest';
	$scope.categoryName = 'Test';
	$scope.snippetsToDisplay = null;

	$scope.addCategory = function () {
		snippetDb.addCategory({name: $scope.categoryName, subcategories: [] }).then(function () {
			console.debug('AddCategory: Success');
			$scope.getCategories();
		});
	};

	$scope.addSubcategory = function (category) {
		console.debug('Add Subcategory: ' + $scope.subcategoryName);
		console.debug('Add Subcategory parent:');
		console.debug(category);
		category.subcategories.push({name: $scope.subcategoryName});
		delete category.$$hashKey;
		snippetDb.addCategory(category).then(function () {
			console.debug('AddCategory: Success');
			$scope.getCategories();
		});
	};

	$scope.showCategory = function ($event, category) {
		$event.stopPropagation()
		console.debug(category);
		$scope.snippetsToDisplay = category;
	};

	$scope.hideSubcategory = function (category) {

	};

	$scope.showSubcategory = function (category) {

	};

	$scope.getCategories = function () {
		snippetDb.getCategories().then(function (data) {
			console.debug(data);
			$scope.categories = data;
		}, function (err) {
			alert(err);
		});
	};

	$scope.resetCategories = function () {
		snippetDb.clearStorage().then(function () {
			$scope.getCategories();
		});
	};

	snippetDb.open().then(function () {
		$scope.getCategories();
	});
}]);

snippetApp.factory('SnippetDb', ['$window', '$q', function ($window, $q) {
	var db;
	var indexedDbRequest = $window.indexedDB.open("SnippetDb", 18);
	var lastIndex = 0;

	var snippetDb = {}
	snippetDb.open = function () {

		var deferred = $q.defer();

		indexedDbRequest.onupgradeneeded = function (e) {
			console.log("DB Open Request: Running upgrade");
			var thisDB = e.target.result;

			if (thisDB.objectStoreNames.contains("category")) {
				thisDB.deleteObjectStore('category');
			}

			var objectStorage = thisDB.createObjectStore("category", {keyPath: 'id'});
			//objectStorage.createIndex('subcategories', 'subcategories', {unique: false, multiEntry: true});
		};

		indexedDbRequest.onsuccess = function (e) {
			console.log("DB Open Request: Success!");
			db = e.target.result;
			deferred.resolve();
		};

		indexedDbRequest.onerro = function () {
			deferred.reject();
		}

		return deferred.promise;
	}

	snippetDb.getCategories = function () {

		var deferred = $q.defer();

		var transaction = db.transaction(["category"], "readwrite");
		var categoryStore = transaction.objectStore("category");

		// Get everything in the store;
		var keyRange = IDBKeyRange.lowerBound(0);
		var request = categoryStore.openCursor(keyRange);
		var categories = [];

		request.onsuccess = function (e) {
			console.debug('Get Success');
			var result = e.target.result;
			if (result === null || result === undefined) {
				deferred.resolve(categories);
			}
			else {
				categories.push(result.value);
				if (result.value.id > lastIndex) {
					lastIndex = result.value.id;
				}

				result.continue();
			}
		}

		request.onerror = function () {
			console.debug('Get error');
			deferred.reject();
		}

		return deferred.promise;
	};

	snippetDb.addCategory = function (category) {
		var deferred = $q.defer();

		var transaction = db.transaction(["category"], "readwrite");
		var categoryStore = transaction.objectStore("category");

		if (!category.id) {
			category.id = ++lastIndex;
		}

		if (category.subcategories.length > 0) {
			for (var subcategory in category.subcategories) {
				category.subcategories[subcategory].id = ++lastIndex;
			}
		}

		var request = categoryStore.put(category);

		request.onerror = function (e) {
			console.log("Error", e.target.error.name);
			deferred.reject();
		}

		request.onsuccess = function (e) {
			console.log('saved');
			deferred.resolve(e.target.result);
		};

		return deferred.promise;
	};

	snippetDb.clearStorage = function () {
		var deferred = $q.defer();

		var transaction = db.transaction(["category"], "readwrite");
		var categoryStore = transaction.objectStore("category");
		var request = categoryStore.clear();

		request.onsuccess = function () {
			console.debug('cleared');
			lastIndex = 0;
			deferred.resolve();
		};

		request.onerror = function () {
			deffered.reject();
		};

		return deferred.promise;
	}

	return snippetDb;

}]);