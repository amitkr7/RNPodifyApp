const getById = (id) => {
    return document.getElementById(id)
}

const password = getById('password')
const confirmPassword = getById('confirm-password')
const form = getById('form')
const container = getById('container')
const loader = getById('loader')
const button = getById('submit')
const error = document.getElementById("error");
const success = document.getElementById("success");

error.style.display = "none";
success.style.display = "none";
loader.style.display = "block"
container.style.display = "none"

let token, userId
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%^&\*])[a-zA-Z\d!@#\$%^&\*]+$/

window.addEventListener('DOMContentLoaded', async () => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => {
            return searchParams.get(prop)
        }
    })
    token = params.token
    userId = params.userId

    const res = await fetch("/auth/verify-reset-pass-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
            token, userId
        })
    })

    if (!res.ok) {
        const { error } = await res.json()
        loader.innerText = error
        return
    }

    loader.style.display = "none"
    container.style.display = "block"
})

const displayError = (errorMsg) => {
    success.style.display = "none"
    error.innerText = errorMsg
    error.style.display = "block"
}
const displaySuccess = (successMsg) => {
    error.style.display = "none"
    success.innerText = successMsg
    success.style.display = "block"
}

const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.value.trim()) {
        return displayError("Password is Missing")
    }

    if (!passwordRegex.test(password.value)) {
        return displayError("Password is too Simple, Use alphanumeric with special character")
    }

    if (password.value !== confirmPassword.value) {
        return displayError("Password and Confirm Password do not match!")
    }

    button.disabled = true;
    button.innerText = "Please Wait"
    const res = await fetch("/auth/update-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
            token, userId, password: password.value
        })
    })

    button.disabled = false;
    button.innerText = "Reset Password"

    if (!res.ok) {
        const { error } = await res.json()
        return displayError(error)
    }

    displaySuccess("Your Password is reset Successfully!")
    password.value = ""
    confirmPassword.value = ""
}

form.addEventListener('submit', handleSubmit)
