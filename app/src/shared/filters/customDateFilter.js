angular
    .module('openDeskApp')
    .filter('customDate', customDateFilterFactory);

function customDateFilterFactory(dateFilter) {
    function customDateFilter(dateValue, givenFormat) {
        var seconds = Math.floor((new Date() - dateValue) / 1000);

        var interval = Math.floor(seconds / 86400); //dage
        if(interval == 1)
        {
            return 'Igår kl. ' + dateFilter(dateValue, "HH:mm");
        } 
        else if (interval >= 2)
        {
            var format = 'dd. MMMM';

            if(new Date(dateValue).getFullYear() != new Date().getFullYear()) {
                format += 'dd. MMMM yyyy kl. HH:mm';
            }

            if(givenFormat = 'showTime') {
                format += ' kl. HH:mm';
            }

            return dateFilter(dateValue, format);
        }

        interval = Math.floor(seconds / 3600); //timer
        if (interval == 1) {
            return interval + " time siden";
        } else if(interval > 1 && interval < 24) {
            return interval + " timer siden";
        }

        interval = Math.floor(seconds / 60); //minutter
        if(interval == 1) {
            return interval + " minut siden";
        }
        if (interval > 1 && interval < 60) {
            return interval + " minutter siden";
        }

        return "Få sekunder siden";
    }

    return customDateFilter;
}