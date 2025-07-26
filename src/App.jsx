import {useEffect, useReducer} from "react";

const initialState = {
    candidates: [],
    newCandidate: "",
    status: "loading",
};

function reducer(state, action) {
    switch (action.type) {
        case "reset_votes":
            return {
                ...state, candidates: state.candidates.map((candidate) => ({...candidate, votes: 0})),
            };

        case "update_new_candidate":
            return {...state, newCandidate: action.payload};
        case "add_candidate":
            if (!action.payload.trim() || state.candidates.some((candidate) => candidate.name === action.payload)) {
                return state;
            }
            return {...state, candidates: [...state.candidates, {name: action.payload, votes: 0}], newCandidate: ""};


        case "dataReceived":
            return {
                ...state, candidates: action.payload,
                status: "ready",
            }
        case "dataFailed":
            return {...state, status: "error"}

        case "vote_up":
            return  incrementVote(state, action.payload);

        case "vote_down":
            return decrementVote(state, action.payload);
    }
}


function incrementVote(state, name){
    return {...state, candidates: state.candidates.map((candidate) =>
            candidate.name === name ? {...candidate, votes: candidate.votes + 1}: candidate
        )}
}

function decrementVote(state, name){
    return {...state, candidates: state.candidates.map((candidate) =>
            candidate.name === name ? {...candidate, votes:Math.max(candidate.votes - 1,0) }: candidate
        )}
}

function VoteTracker() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:9000/candidates");
                if (!res.ok) {
                    throw new Error("Failed to fetch data")
                }
                const data = await res.json();
                dispatch({type: "dataReceived", payload: data});
            } catch (error) {
                dispatch({type: "dataFailed"});
            }
        }

        fetchData();
    }, []);

    if (state.status === "loading") {
        return <p>Data is still loading, please wait</p>
    }
    if (state.status === "error") {
        return <p>Failed to fetch Data</p>
    }

    return (
        <>
            <h1>Vote Tracker</h1>
            <ul>
                {state.candidates.map((candidate) => (
                    <li key={candidate.id}>{candidate.name}: {candidate.votes} votes
                        <button onClick={() => dispatch({type: "vote_up", payload: candidate.name})}>+</button>
                        <button onClick={() => dispatch({type: "vote_down", payload: candidate.name})}>-</button>
                    </li>

                ))}
            </ul>
            <button onClick={() => dispatch({type: "reset_votes"})}>Reset Votes</button>

            <div>
                <h2>Add Candidate</h2>
                <input type="text" value={state.newCandidate}
                       placeholder="Candidate name"
                       onChange={(event) => dispatch({type: "update_new_candidate", payload: event.target.value})}/>

                < button onClick={() => dispatch({type: "add_candidate", payload: state.newCandidate})}> Add< /button>
            </div>
        </>
    );

}

export default VoteTracker;
