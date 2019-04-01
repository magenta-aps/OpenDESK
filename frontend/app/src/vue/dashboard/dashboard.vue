<template>
    <aside>
        <h1>Hello, this is Dashboard!</h1>
        <p>I'm a Vue.js component</p>
    </aside>
</template>

<script>
    const Sidebar = new Vue({
        el: '#dashboard',
        data() {
            return {
                name: 'Dashboard',
            };
        },
    });
</script>

<style scoped>
    aside {
        background-color: rgba(0, 0, 0, 0.1);
        padding: 2rem;
    }

    aside h1,
    aside p {
        margin: 0;
    }
</style>
