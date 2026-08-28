/* =========================================
   IBS PHOTOGRAPHY
   Google Sheets API
========================================= */


// ==================================================
// GOOGLE APPS SCRIPT API
// ==================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwbK8AabmgnSVsl9ZXidA_kv-cV9mWFNLv5lz3tav03D4trssU_jSc_gCL6X2dCSqlDRQ/exec";


// ==================================================
// GLOBAL DATA
// ==================================================

let students = [];

let currentHeroSlide = 0;

let heroInterval;

let currentStudent = null;

let currentPhotoIndex = 0;


// ==================================================
// DOM ELEMENTS
// ==================================================

const loadingScreen =
    document.getElementById("loadingScreen");

const heroSlider =
    document.getElementById("heroSlider");

const studentsGrid =
    document.getElementById("studentsGrid");

const portfolioModal =
    document.getElementById("portfolioModal");

const portfolioProfile =
    document.getElementById("portfolioProfile");

const portfolioName =
    document.getElementById("portfolioName");

const portfolioClass =
    document.getElementById("portfolioClass");

const portfolioBio =
    document.getElementById("portfolioBio");

const portfolioGallery =
    document.getElementById("portfolioGallery");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxTitle =
    document.getElementById("lightboxTitle");

const lightboxDescription =
    document.getElementById("lightboxDescription");


// ==================================================
// START WEBSITE
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

    loadWebsiteData();

});


// ==================================================
// LOAD DATA FROM GOOGLE SHEETS
// ==================================================

async function loadWebsiteData() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Unable to connect to API."
            );
        }

        const data =
            await response.json();

        students =
            data.students || [];

        console.log(
            "Students loaded:",
            students
        );

        createHeroSlider();

        createStudentsGrid();

        hideLoading();

    }

    catch (error) {

        console.error(
            "Website loading error:",
            error
        );

        studentsGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                padding:60px 0;
                text-align:center;
            ">
                <h3>Unable to load portfolio.</h3>

                <p style="
                    margin-top:10px;
                    color:#777;
                ">
                    Please try refreshing the page.
                </p>
            </div>
        `;

        hideLoading();

    }

}


// ==================================================
// HIDE LOADING
// ==================================================

function hideLoading() {

    setTimeout(() => {

        loadingScreen.classList.add("hidden");

    }, 500);

}


// ==================================================
// HERO SLIDESHOW
// ==================================================

function createHeroSlider() {

    heroSlider.innerHTML = "";

    /*
       Ambil maksimal 5 foto terbaik
       dari seluruh portfolio siswa.
    */

    const heroPhotos = [];

    students.forEach(student => {

        if (!student.photos) return;

        student.photos.forEach(photo => {

            if (
                photo.image_url &&
                photo.image_url.trim() !== ""
            ) {

                heroPhotos.push({
                    ...photo,
                    studentName: student.name
                });

            }

        });

    });


    const selectedPhotos =
        heroPhotos.slice(0, 5);


    /*
       Jika belum ada foto,
       gunakan background kosong.
    */

    if (selectedPhotos.length === 0) {

        heroSlider.innerHTML = `
            <div class="hero-slide active"></div>
        `;

        return;

    }


    selectedPhotos.forEach(
        (photo, index) => {

            const slide =
                document.createElement("div");

            slide.className =
                "hero-slide";

            if (index === 0) {
                slide.classList.add("active");
            }

            slide.style.backgroundImage =
                `url("${photo.image_url}")`;

            heroSlider.appendChild(slide);

        }
    );


    updateSlideCounter(
        selectedPhotos.length
    );


    /*
       Auto slideshow
    */

    if (selectedPhotos.length > 1) {

        heroInterval =
            setInterval(() => {

                nextHeroSlide();

            }, 6000);

    }

}


// ==================================================
// NEXT HERO SLIDE
// ==================================================

function nextHeroSlide() {

    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );

    if (slides.length <= 1) return;


    slides[
        currentHeroSlide
    ].classList.remove("active");


    currentHeroSlide++;

    if (
        currentHeroSlide >=
        slides.length
    ) {

        currentHeroSlide = 0;

    }


    slides[
        currentHeroSlide
    ].classList.add("active");


    updateSlideCounter(
        slides.length
    );

}


// ==================================================
// PREVIOUS HERO SLIDE
// ==================================================

function previousHeroSlide() {

    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );

    if (slides.length <= 1) return;


    slides[
        currentHeroSlide
    ].classList.remove("active");


    currentHeroSlide--;

    if (currentHeroSlide < 0) {

        currentHeroSlide =
            slides.length - 1;

    }


    slides[
        currentHeroSlide
    ].classList.add("active");


    updateSlideCounter(
        slides.length
    );

}


// ==================================================
// HERO COUNTER
// ==================================================

function updateSlideCounter(total) {

    const counter =
        document.getElementById(
            "slideCounter"
        );

    if (!counter) return;


    const current =
        String(
            currentHeroSlide + 1
        ).padStart(2, "0");


    const totalFormatted =
        String(total)
            .padStart(2, "0");


    counter.textContent =
        `${current} / ${totalFormatted}`;

}


// ==================================================
// HERO BUTTONS
// ==================================================

document
    .getElementById("nextSlide")
    .addEventListener(
        "click",
        () => {

            clearInterval(heroInterval);

            nextHeroSlide();

        }
    );


document
    .getElementById("previousSlide")
    .addEventListener(
        "click",
        () => {

            clearInterval(heroInterval);

            previousHeroSlide();

        }
    );


// ==================================================
// CREATE STUDENT GRID
// ==================================================

function createStudentsGrid() {

    studentsGrid.innerHTML = "";


    students.forEach(
        (student, index) => {

            const card =
                document.createElement("article");

            card.className =
                "student-card";


            const number =
                String(index + 1)
                    .padStart(2, "0");


            const profileImage =
                student.profile &&
                student.profile.trim() !== ""

                    ? student.profile

                    : createPlaceholder(
                        student.name
                    );


            card.innerHTML = `

                <div class="student-image">

                    <span class="student-number">
                        ${number}
                    </span>

                    <img
                        src="${profileImage}"
                        alt="${escapeHTML(student.name)}"
                        loading="lazy"
                        onerror="this.src='${createPlaceholder(student.name)}'"
                    >

                </div>

                <div class="student-information">

                    <h3>
                        ${escapeHTML(student.name)}
                    </h3>

                    <p>
                        ${escapeHTML(student.class || "")}
                    </p>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    openPortfolio(student);

                }
            );


            studentsGrid.appendChild(card);

        }
    );

}


// ==================================================
// OPEN STUDENT PORTFOLIO
// ==================================================

function openPortfolio(student) {

    currentStudent =
        student;

    currentPhotoIndex = 0;


    portfolioProfile.src =
        student.profile ||
        createPlaceholder(
            student.name
        );


    portfolioProfile.onerror =
        function () {

            this.src =
                createPlaceholder(
                    student.name
                );

        };


    portfolioProfile.alt =
        student.name;


    portfolioName.textContent =
        student.name;


    portfolioClass.textContent =
        student.class ||
        "Student Photographer";


    portfolioBio.textContent =
        student.bio ||
        "Young Photographer";


    createPortfolioGallery(
        student
    );


    portfolioModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    /*
       Scroll modal ke atas
    */

    portfolioModal.scrollTop = 0;

}


// ==================================================
// CLOSE PORTFOLIO
// ==================================================

function closePortfolio() {

    portfolioModal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closePortfolio
    );


document
    .querySelector(".modal-background")
    .addEventListener(
        "click",
        closePortfolio
    );


// ==================================================
// CREATE PORTFOLIO GALLERY
// ==================================================

function createPortfolioGallery(
    student
) {

    portfolioGallery.innerHTML = "";


    if (
        !student.photos ||
        student.photos.length === 0
    ) {

        portfolioGallery.innerHTML = `

            <div style="
                grid-column:1/-1;
                padding:80px 0;
                text-align:center;
            ">

                <h3>
                    No photographs yet.
                </h3>

                <p style="
                    margin-top:10px;
                    color:#777;
                ">
                    This portfolio will be updated soon.
                </p>

            </div>

        `;

        return;

    }


    student.photos.forEach(
        (photo, index) => {

            if (
                !photo.image_url ||
                photo.image_url.trim() === ""
            ) return;


            const item =
                document.createElement("article");

            item.className =
                "gallery-item";


            item.innerHTML = `

                <div class="gallery-image">

                    <img
                        src="${photo.image_url}"
                        alt="${escapeHTML(photo.title || "Photography")}"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >

                </div>

                <div class="gallery-information">

                    <h3>
                        ${escapeHTML(
                            photo.title ||
                            "Untitled"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            photo.description ||
                            ""
                        )}
                    </p>

                </div>

            `;


            item.addEventListener(
                "click",
                () => {

                    openLightbox(
                        student,
                        index
                    );

                }
            );


            portfolioGallery.appendChild(
                item
            );

        }
    );

}


// ==================================================
// OPEN LIGHTBOX
// ==================================================

function openLightbox(
    student,
    photoIndex
) {

    if (
        !student.photos ||
        student.photos.length === 0
    ) return;


    /*
       Skip empty image URLs
    */

    let validPhotos =
        student.photos.filter(
            photo =>
                photo.image_url &&
                photo.image_url.trim() !== ""
        );


    if (validPhotos.length === 0)
        return;


    /*
       Cari foto berdasarkan index
    */

    let photo =
        student.photos[photoIndex];


    if (
        !photo ||
        !photo.image_url
    ) {

        photo =
            validPhotos[0];

        photoIndex = 0;

    }


    currentPhotoIndex =
        photoIndex;


    lightboxImage.src =
        photo.image_url;


    lightboxTitle.textContent =
        photo.title ||
        "Untitled";


    lightboxDescription.textContent =
        photo.description ||
        "";


    lightbox.classList.add(
        "active"
    );

}


// ==================================================
// CLOSE LIGHTBOX
// ==================================================

function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );

    lightboxImage.src = "";

}


document
    .getElementById("closeLightbox")
    .addEventListener(
        "click",
        closeLightbox
    );


// ==================================================
// LIGHTBOX NAVIGATION
// ==================================================

function nextPhoto() {

    if (!currentStudent) return;


    const photos =
        currentStudent.photos;


    if (!photos || photos.length === 0)
        return;


    let nextIndex =
        currentPhotoIndex + 1;


    if (
        nextIndex >=
        photos.length
    ) {

        nextIndex = 0;

    }


    /*
       Cari foto berikutnya
       yang mempunyai URL
    */

    let attempts = 0;

    while (
        !photos[nextIndex].image_url &&
        attempts < photos.length
    ) {

        nextIndex++;

        if (
            nextIndex >=
            photos.length
        ) {

            nextIndex = 0;

        }

        attempts++;

    }


    currentPhotoIndex =
        nextIndex;


    const photo =
        photos[currentPhotoIndex];


    lightboxImage.src =
        photo.image_url;


    lightboxTitle.textContent =
        photo.title ||
        "Untitled";


    lightboxDescription.textContent =
        photo.description ||
        "";

}


function previousPhoto() {

    if (!currentStudent) return;


    const photos =
        currentStudent.photos;


    if (!photos || photos.length === 0)
        return;


    let previousIndex =
        currentPhotoIndex - 1;


    if (previousIndex < 0) {

        previousIndex =
            photos.length - 1;

    }


    let attempts = 0;

    while (
        !photos[previousIndex].image_url &&
        attempts < photos.length
    ) {

        previousIndex--;

        if (previousIndex < 0) {

            previousIndex =
                photos.length - 1;

        }

        attempts++;

    }


    currentPhotoIndex =
        previousIndex;


    const photo =
        photos[currentPhotoIndex];


    lightboxImage.src =
        photo.image_url;


    lightboxTitle.textContent =
        photo.title ||
        "Untitled";


    lightboxDescription.textContent =
        photo.description ||
        "";

}


document
    .getElementById("nextPhoto")
    .addEventListener(
        "click",
        nextPhoto
    );


document
    .getElementById("previousPhoto")
    .addEventListener(
        "click",
        previousPhoto
    );


// ==================================================
// KEYBOARD
// ==================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeLightbox();

            closePortfolio();

        }


        if (
            lightbox.classList.contains(
                "active"
            )
        ) {

            if (
                event.key === "ArrowRight"
            ) {

                nextPhoto();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                previousPhoto();

            }

        }

    }
);


// ==================================================
// CLICK OUTSIDE LIGHTBOX
// ==================================================

lightbox.addEventListener(
    "click",
    event => {

        if (
            event.target === lightbox
        ) {

            closeLightbox();

        }

    }
);


// ==================================================
// PLACEHOLDER IMAGE
// ==================================================

function createPlaceholder(
    name
) {

    const initials =
        name
            .split(" ")
            .map(
                word =>
                    word.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();


    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="600"
            height="700"
            viewBox="0 0 600 700"
        >

            <rect
                width="600"
                height="700"
                fill="#dedbd3"
            />

            <text
                x="300"
                y="350"
                text-anchor="middle"
                dominant-baseline="middle"
                font-family="Arial"
                font-size="100"
                fill="#777"
            >
                ${initials}
            </text>

        </svg>

    `;


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(
    text
) {

    if (!text) return "";

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
