# Dashboard tiles

We created a dashboard that will display the main features for the user. 
It consists of several tiles, implemented using the following HTML:
```
<div class="dashboard-grid">
    <div class="tile"></div>
</div>
```
Positioning and alignment is done through flex-box.
```
.dashboard-grid {    
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: space-between;
  
    .tile {
        flex-grow: 1;
        display: inline-block;
        width: 150px;
        height: 150px;
        overflow: hidden;
        margin: .25rem;
    }
}
```