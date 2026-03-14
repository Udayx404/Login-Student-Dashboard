const API = "http://localhost:4000/iiest/api/user/login"

async function testRateLimit() {
    console.log("Sending 15 requests to login endpoint...\n")

    for (let i = 1; i <= 15; i++) {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@test.com", password: "wrongpassword" })
        })
        const data = await res.json()
        console.log(`Request ${i}: status=${res.status} | message=${data.message}`)
    }
}

testRateLimit()