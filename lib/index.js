'user strict';

/**
 * Method using to return time in scounds
 *   @param {string} time - time from report json
 *   @return {number} - time in secounds
 * */
function _convertTime(time) {
    /**
     * @return {number}
     */
    function Round(n, k) {
        const factor = Math.pow(10, k);
        return Math.round(n * factor) / factor;
    }

    return Round(time / 1000000000, 2);
}

module.exports = {
    getStatistic(cucumberReport, statisticType) {
        let statistic = [];

        switch (statisticType) {
            case 'scenarios':
                const result = {
                    'scenarios number': 0,
                    'suite duration(minutes)': 0,
                    'passed': 0,
                    'failed': 0
                };
                cucumberReport.forEach(feature => {
                    feature.elements.forEach(scenario => {
                        const duration = scenario.steps.reduce((accumulator, current) => accumulator + current.result.duration, 0);
                        const status = scenario.steps.every(current => current.result.status === 'passed') ? 'passed' : 'failed';
                        if (status === 'passed') {
                            result['suite duration(minutes)'] += _convertTime(duration) / 60;
                            result['passed']++;
                        } else {
                            result['failed']++;
                        }
                        result['scenarios number']++;
                        statistic.push({
                            name: scenario.name,
                            status: status,
                            duration: _convertTime(duration)
                        });
                    });
                });
                result.scenarios = statistic;
                statistic = result;
                break;
            case 'steps':
                cucumberReport.forEach(feature => {
                    feature.elements.forEach(scenario => {
                        scenario.steps.forEach(current => {
                            const indexLoggetItem = statistic.findIndex(item => item.name === current.name);

                            if (~indexLoggetItem) {
                                const currentDuration = _convertTime(current.result.duration);
                                if (currentDuration < statistic[indexLoggetItem].minDuration) {
                                    statistic[indexLoggetItem].minDuration = currentDuration;
                                }
                                if (currentDuration > statistic[indexLoggetItem].maxDuration) {
                                    statistic[indexLoggetItem].maxDuration = currentDuration;
                                }
                            } else {
                                statistic.push({
                                    name: current.name || "Hook",
                                    keyword: current.keyword,
                                    status: current.result.status,
                                    minDuration: _convertTime(current.result.duration),
                                    maxDuration: _convertTime(current.result.duration),
                                    location: current.match.location
                                });
                            }
                        });
                    });
                });
        }
        return statistic;
    },

    statisticSort(asc, statisticType) {
        return function (a, b) {
            switch (statisticType) {
                case 'scenario':
                    a = a.duration;
                    b = b.duration;
                    break;
                case 'steps':
                    a = a.maxDuration;
                    b = b.maxDuration;
            }


            if (isNaN(a)) {
                return 1;
            }
            else if (isNaN(b)) {
                return -1;
            }
            else if (a === b) {
                return 0;
            }
            else if (asc) {
                return a < b ? -1 : 1;
            }
            else if (!asc) {
                return a < b ? 1 : -1;
            }
        };
    }

};