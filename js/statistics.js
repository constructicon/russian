const x = document.getElementById("syntType").value;
drawChartSem()
drawChartSTC()
drawChartSFA()

// draw charts
async function drawChartSem() {
    const datapoints = await getDataSem(document.getElementById("syntType").value);
    const ctx = document.getElementById('chart1');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datapoints.labels,
            datasets: [{
                data: datapoints.numbers,
                fill: false,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    offset: 3
                }
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: {
                        precision: 0
                    },
                    grace: '1'
                }
            }
        }
    });
};

async function drawChartSTC() {
    const datapoints = await getDataSTC()
    const ctx = document.getElementById('chart2');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datapoints.labels,
            datasets: [{
                data: datapoints.numbers,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    offset: 3
                }
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            indexAxis: 'y'
        }
    });
};

async function drawChartSFA() {
    const datapoints = await getDataSFA()
    const ctx = document.getElementById('chart3');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datapoints.labels,
            datasets: [{
                data: datapoints.numbers,
                fill: false,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    offset: 3
                }
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            indexAxis: 'y'
        }
    });
};

// get data

async function getDataSFA() {
    const data = await d3.csv('https://raw.githubusercontent.com/constructicon/russian-data/main/database.csv');
    const synt_func_anchor = [];
    const nullConstr = 0;
    data.forEach(function(d) {
        if (d['Synt. func. of anchor'] != null) {
            for (let item of d['Synt. func. of anchor'].split(', ')) {
                if (item != '') {
                    synt_func_anchor.push(item)
                }
            }
        } else {
            nullConstr++
        }
    });
    const countedSFA = synt_func_anchor.reduce(function(dictSFA, synt_func_anchor) {
        if (synt_func_anchor in dictSFA) {
            dictSFA[synt_func_anchor]++
        } else {
            dictSFA[synt_func_anchor] = 1
        }
        return dictSFA
    }, {});
    const sortable = [];
    for (let type in countedSFA) {
        sortable.push([type, countedSFA[type]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    const counted = Object.fromEntries(sortable)
    const labels = Object.keys(counted)
    const numbers = Object.values(counted)
    return {
        labels,
        numbers,
        nullConstr
    };
}

async function getDataSTC() {
    const data = await d3.csv('https://raw.githubusercontent.com/constructicon/russian-data/main/database.csv');
    const synt_func = [];
    const nullConstr = 0;
    data.forEach(function(d) {
        if (d['Synt. type of construction'] != null) {
            for (let item of d['Synt. type of construction'].split(', ')) {
                if (item != '') {
                    synt_func.push(item)
                }
            }
        } else {
            nullConstr++
        }
    });
    const countedSTC = synt_func.reduce(function(dictSTC, synt_func) {
        if (synt_func in dictSTC) {
            dictSTC[synt_func]++
        } else {
            dictSTC[synt_func] = 1
        }
        return dictSTC
    }, {});
    const sortable = [];
    for (let type in countedSTC) {
        sortable.push([type, countedSTC[type]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    const counted = Object.fromEntries(sortable)
    const labels = Object.keys(counted)
    const numbers = Object.values(counted)
    return {
        labels,
        numbers,
        nullConstr
    };
}

async function getDataSem(x) {
    const data = await d3.csv('https://raw.githubusercontent.com/constructicon/russian-data/main/database.csv');
    const sem_types = [];
    const sem_columns = data.columns.slice(data.columns.indexOf('Actionality'));
    data.forEach(function(d) {
        if (x == 'All') {
            sem_columns.forEach(function(column) {
                if (d[column] != '') {
                    sem_types.push(column)
                }
            })
        } else if (d['Synt. type of construction'] == x) {
            sem_columns.forEach(function(column) {
                if (d[column] != '') {
                    sem_types.push(column)
                }
            })
        }
    });
    const countedSem = sem_types.reduce(function(dictSem, sem_types) {
        if (sem_types in dictSem) {
            dictSem[sem_types]++
        } else {
            dictSem[sem_types] = 1
        }
        return dictSem
    }, {});
    const sortable = [];
    for (let type in countedSem) {
        sortable.push([type, countedSem[type]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    const counted = Object.fromEntries(sortable)
    const labels = Object.keys(counted)
    const numbers = Object.values(counted)
    return {
        labels,
        numbers
    };
}

async function changeData(chart_id) {
    const datapoints = await getDataSem(document.getElementById("syntType").value);
    const chart = Chart.getChart(chart_id);
    chart.data.labels = datapoints.labels;
    chart.data.datasets.forEach(dataset => {
        dataset.data = datapoints.numbers;
    });
    chart.update();

    //css
    const totalBars = chart.data.labels.length;
    const chartBox = document.querySelector('.chart-container1');
    if (totalBars > 25) {
        newHeight = totalBars * 20;
        chartBox.style.height = newHeight + 'px'
    } else if (totalBars < 7) {
        newHeight = totalBars * 50;
        chartBox.style.height = newHeight + 'px'
    } else {
        newHeight = totalBars * 35;
        chartBox.style.height = newHeight + 'px'
    }
}

// Top of anchors by parts of speech

async function makeTopLists() {
    const data = await d3.csv('https://raw.githubusercontent.com/constructicon/russian-data/main/database.csv');
    // добавить обработку столбика с леммами и частями речи
}

async function printTopLists(words, id) {
    const div = document.getElementById(id);
    const ol = document.createElement('ol');
    div.appendChild(ol);
    for (let word of words) {
        const li = document.createElement('li');
        li.innerHTML = word;
        ol.appendChild(li);
    }
}

const verbs = ['знать', 'говорить', 'хотеть', 'сказать', 'быть', 'дать', 'мочь', 'иметь', 'взять', 'делать']
const nouns = ['время', 'дело', 'раз', 'чёрт', 'пора', 'день', 'случай', 'вид', 'рука', 'слово']
const adjectives = ['равный', 'хороший', 'полный', 'другой', 'нужный', 'плохой', 'последний', 'целый', 'первый', 'должный']


printTopLists(verbs, 'TopVerbs')
printTopLists(nouns, 'TopNouns')
printTopLists(adjectives, 'TopAdjectives')