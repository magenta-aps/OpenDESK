
    angular
            .module('openDeskApp.systemsettings')
            .factory('tenantsService', tenantsService);
    
    function tenantsService($http){
        var service = {
            getAllTenants: getAllTenants,
            getTenantsInfo: getTenantsInfo,
            saveTenantInfo: saveTenantInfo,
            getOpeneModules: getOpeneModules,
            deleteTenantModules: deleteTenantModules,
            createTenant: createTenant
        };
        return service;
        
        function getAllTenants(){
            return $http.get('/api/tenants').then(function(response){
                var tenants = response.data.tenants.map(function(item){
                    return item.tenantDomain;
                })
                return tenants;
            });
        }
        
        function getTenantsInfo(){
            return $http.get('/api/opendesk/tenants').then(function(response){
                return response.data;
            });
        }
        
        function saveTenantInfo(tenant){
            return $http.post('/api/opendesk/tenant/update', tenant).then(function(response){
                return response.data;
            });
        }
        
        function getOpeneModules(){
            return $http.get('/api/opendesk/modules').then(function(response){
                return response.data;
            });
        }
        
        function deleteTenantModules(tenant){
            return $http.delete('/api/opendesk/tenant/' + tenant + '/modules');
        }
        
        function createTenant(tenant){
            //replace windows path
            tenant.tenantContentStoreRoot = tenant.tenantContentStoreRoot.replace(/\\/g, "/");
            return $http.post('/api/opendesk/tenant', tenant);
        }
    }