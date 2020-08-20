function link (scope, element, attrs, controller) {
    var lazyLoader = $injector.get("lazyLoader");
    lazyLoader.putTemplates(scope.data.listTemplates);
}