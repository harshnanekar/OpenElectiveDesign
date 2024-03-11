
let url = 'http://localhost:8080/elective/insertStudentCourses';

    for(let i = 0; i < 5000; i++) {
        let body = {"eventLid":"34","timeString":"16:28:28","courseArray":[{"subjectLid":"210","preference":1},{"subjectLid":"234","preference":2},{"subjectLid":"209","preference":3},{"subjectLid":"211","preference":4},{"subjectLid":"232","preference":5}],"userLid":i,"basketLid":"122"}
        fetchData(url,body)
    }
    function fetchData(url, body) {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(body) 
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                
                console.log('Inserted successfully ' , data)
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }