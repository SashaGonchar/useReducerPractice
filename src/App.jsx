import {useEffect, useReducer} from "react";

const initialState = {
    candidates: [],
    newCandidate: "",
    status: "loading",
};

function reducer(state, action) {
    switch (action.type) {
        case "dataReceived":
            return {
                ...state, candidates: action.payload,
                status: "ready",
            }
        case "dataFailed":
            return {...state, status:"error"}
    }
}

function VoteTracker() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        async function fetchData() {
            try{
                const res = await fetch("http://localhost:9000/candidates");
                if (!res.ok) {
                    throw new Error("Failed to fetch data")
                }
                const data = await res.json();
                dispatch({type: "dataReceived", payload: data});
            }
            catch (error){
                dispatch({type: "dataFailed"});
            }
        }

        fetchData();
    }, []);

    if(state.status === "loading"){
        return <p>Data is still loading, please wait</p>
    }
    if(state.status === "error"){
        return <p>Failed to fetch Data</p>
    }

    return (
        <>
            <h1>Vote Tracker</h1>
            <ul>
                {state.candidates.map((candidate) => (
                    <li key={candidate.id}>{candidate.name}: {candidate.votes} votes
                        <button>+</button>
                        <button>-</button>
                    </li>

                ))}
            </ul>
            <button>Reset Votes</button>

            <div>
                <h2>Add Candidate</h2>
                <input type="text" placeholder="Candidate name"/>
                <button>Add</button>
            </div>
        </>
    );
}


export default VoteTracker;
