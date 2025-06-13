import { useState, useEffect } from "react"

export default function Account() {

    const [taNames, setTaNames] = useState([]) 
    const [wsLinks, setWsLinks] = useState([])

    useEffect(() => {
        fetch("/api/talist")
            .then(res => res.json())
            .then(res => (setTaNames(res.message)))
            .catch((err) => console.error('Error:', err))
    }, [])

    useEffect(() => {
        fetch("/api/worksheets")
            .then(res => res.json())
            .then(res => setWsLinks(res.message))
    }, [])

    function processWS(ws_item) {
        fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ws_item }),
          })
          .then(res => res.json())
          .then(res => (setTaNames(res.message)))
          .catch((err) => console.error('Error:', err))
    }

    for (let i = 0; i < wsLinks.length; i ++) {
        processWS(wsLinks[i])
    }

    const taNameList = taNames.map(taArr => <p>{taArr[0]}: {taArr[1]}</p>)

    return (
        <>
        <div>
            {taNameList}
        </div>
        </>
    )
}