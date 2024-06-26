
document.addEventListener('DOMContentLoaded', function () {
     // modal vars
    const modal = document.getElementById("modal");
    const userName = document.getElementById("modal-form-name");
    const userSurname = document.getElementById("modal-form-surname");
    const modalSubmitButton = document.getElementById("modal-submit-btn");

    // Show the modal 
    modal?.classList?.add("show");

    // Close the modal 
    modalSubmitButton?.addEventListener("click", () => {
        console.log("User name ",userName.value,)
        if(userName.value?.length && userSurname.value?.length) {
            localStorage.setItem("user",JSON.stringify({name: userName.value,surname: userSurname.value}));
            
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
            }, 500); 
        }else{
            alert("Fill fields")
        } 
    });
})
