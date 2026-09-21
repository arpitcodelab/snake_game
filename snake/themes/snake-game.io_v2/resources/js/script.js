window.addEventListener("DOMContentLoaded", function () {
    showContentGame();

    /**
     ** HELPER FUNCTIONS
     */
    const qSel = (obj) => document.querySelector(obj);
    const qSelAll = (obj) => document.querySelectorAll(obj);

    /**
     ** GLOBAL VARIABLES
     */
    const nav = qSel('#nav');
    const nav_container = qSel('#nav_icon');
    const nav_icon = qSel('#nav_icon > i');
    const nav_links = qSelAll('#nav > ul > li > a');

    /**
     ** OPEN SIDEBAR
     */
    nav_container.addEventListener('click', () => {
        if (nav.classList.contains('open')) {

            closeSidebar();
            return;
        }

        nav.classList.add('open');
        $('html').addClass('oL');
        $('#container div').first().addClass('ml-350');
        $('html').css('top', '0');
        $('.overlay').removeClass('c');
        $('.svg-open').addClass('rotate');
    });

    /**
     ** CLOSE SIDEBAR AFTER CLICK ON LINK 
     */
    nav_links.forEach(link => {
        link.addEventListener('click', e => {
            //            e.stopPropagation();
            //
            //            closeSidebar();
        });
    });

    /**
     ** MOUSE TRACK EVENT 
     */
    if (innerWidth > 1024) {
        // Mouse move event
        //    window.addEventListener('mousemove', e => {
        //        const mouseY = Math.round((e.y * 100) / innerHeight);
        //        const mouseX = Math.round((e.x * 100) / innerWidth);
        //
        //        // Detect mouse position
        //        if (!nav.classList.contains('open') && mouseX <= 20) {
        //            nav_container.style.top = `${mouseY}%`;
        //            nav_container.classList.add('mouseDistance');
        //        } else {
        //            nav_container.classList.remove('mouseDistance');
        //            nav_container.style.top = '50px';
        //        }
        //        
        //        // Check mouse distance to nav
        //        mouseX <= 10 ? 
        //            nav_container.classList.add('mouseDistanceCloser') : 
        //            nav_container.classList.remove('mouseDistanceCloser');
        //            
        //        if (nav.classList.contains('open') || (mouseY >= 95 || mouseY <= 5)) resetNavIcon();
        //    }); 

        // Mouse leave window
        document.addEventListener('mouseleave', () => {
            //            closeSidebar();
            //            resetNavIcon();
        });
    }
    ;

    /**
     ** CLOSE SIDEBAR WHILE CLICKING OUTSIDE
     */
    window.addEventListener('click', e => {
        //        e.stopPropagation();
        //        if (!nav.classList.contains('open'))
        //            return;
        //        if (!e.target.closest('nav')) {
        //            closeSidebar();
        //            resetNavIcon();
        //        }
    });

    /**
     ** CLOSE SIDEBAR
     */
    function closeSidebar() {
        nav.classList.remove('open');
        $('.svg-open').removeClass('rotate');
        $('html').removeClass('oL');
        $('html').css('top', '');
        $('.overlay').addClass('c');
        $('#container div').first().removeClass('ml-350');
    }

    /**
     ** RESET NAV ICON
     */
    function resetNavIcon() {
        nav_container.classList.remove('mouseDistance');
        nav_container.classList.remove('mouseDistanceCloser');
        nav_container.style.top = '50px';
    }
    add_module();
});
function showContentGame() {
    var container = $("#slope-game");
    var container_overlay = $(".popup-overlay");
    $('#about_icon').click(function () {
        if (container.css("display") == "none") {
            container_overlay.show()
            container.fadeIn(200);
        } else {
            container_overlay.hide()
            container.fadeOut(300);
        }
    });
    $(document).mouseup(function (e) {
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container_overlay.hide();
            container.fadeOut(300);

        }
    });
    $('.close_popup').click(function () {
        container_overlay.hide();
        container.fadeOut(300);
    })
}
function add_module() {
    if (!game_config.url_game) {
        return;
    }
    let url = "/add-module.ajax";
    $.ajax({
        url: url,
        type: "POST",
        data: {
            url_game: game_config.url_game
        },
        success: function (response) {
            if (response) {
                let data = JSON.parse(response);
                if ($("#csrf-token").length) {
                    $("#csrf-token").remove();
                }
                if ($("#gmuid").length) {
                    $("#gmuid").remove();
                }
                $("body").append(data.gm_layout);
                game_vote_load();
            }
        }
    })
}
$(document).on('click', '.button_vote_game', function () {
    event_send_vote(this);
});
function event_send_vote(e) {
    let _game_id = $(e).data('game');
    let _vote = $(e).data('vote');
    let _url = $("#game_vote_panel").data('url');

    let voteUpBtn = $('#vote-up');
    let voteDownBtn = $('#vote-down');
    let upCountEl = $('#up-count');
    let downCountEl = $('#down-count');
    let child_up_last = voteUpBtn.find('.g-footer__button-title_last');
    let child_down_last = voteDownBtn.find('.g-footer__button-title_last');

    let interacted = $(e).hasClass('voted');
    $('.button_vote_game').removeClass('voted');
    $(".g-footer__button-title_last").text("");
    child_down_last.text("Dislike");
    child_up_last.text("Like");

    let local_storage_key = 'voted_game';
    let voted_data = readFromLocalStorage(local_storage_key);
    let pre_vote = '';
    if (voted_data && voted_data.length > 0) {
        $.each(voted_data, function (key, voted_game) {
            if (voted_game.id == _game_id) {
                pre_vote = voted_game.vote;
            }
        });
    }
    if (!interacted) {
        $(e).addClass('voted');
        $(e).find('.g-footer__button-title_last').text("Remove")
    }
    $(e).blur();
    let token = $("#csrf-token").val();
    let gmuid = $("#gmuid").val();
    if (e == null) return;
    $.ajax({
        url: '/game-vote.ajax',
        method: 'POST',
        data: {
            vote: _vote,
            id: _game_id,
            token: token,
            gmuid: gmuid,
            url: _url,
            pre_vote: pre_vote
        },
        success: function (voteData) {
            upCountEl.text(formatNumber(voteData.up_count) || 0);
            downCountEl.text(formatNumber(voteData.down_count) || 0);
            $("#csrf-token").val(voteData.t);
            game_vote_save(_game_id, _vote);
        },
        error: function (jqxhr, textStatus, error) {
            console.error("Error:", error);
        }
    });
}

function game_vote_save(_id, _vote) {
    if (!!readFromLocalStorage('voted_game') && _id !== '' && _vote !== '') {
        let voted_array = readFromLocalStorage('voted_game');
        let interacted = false;
        jQuery.each(voted_array, function (key, value) {
            if (value !== undefined && value.id === _id && key > -1) {
                if (value.vote === _vote) {
                    interacted = true;
                }
                voted_array.splice(key, 1);
            }
        });
        if (interacted) {
            saveToLocalStorage('voted_game', JSON.stringify(voted_array));
            return;
        }
        voted_array.push({
            "id": _id, "vote": _vote
        });
        saveToLocalStorage('voted_game', JSON.stringify(voted_array));
    } else {
        var voted_array = [];
        voted_array.push({
            "id": _id, "vote": _vote
        });
        saveToLocalStorage('voted_game', JSON.stringify(voted_array));
    }
}

function game_vote_load() {
    if ($("#game_vote_panel").length > 0) {
        let _game_id = $("#game_vote_panel").data('game');
        let _url = $("#game_vote_panel").data('url');
        var token = $("#csrf-token").val();
        let voteUpBtn = $('#vote-up');
        let voteDownBtn = $('#vote-down');
        let upCountEl = $('#up-count');
        let downCountEl = $('#down-count');
        let child_up_last = voteUpBtn.find('.g-footer__button-title_last');
        let child_down_last = voteDownBtn.find('.g-footer__button-title_last');
        $.getJSON('/game-vote.ajax', { id: _game_id, token: token, url: _url })
            .done(function (voteData) {
                upCountEl.text(formatNumber(voteData.up_count) || 0);
                downCountEl.text(formatNumber(voteData.down_count) || 0);
                $("#csrf-token").val(voteData.t);
                //load state vote
                let local_storage_key = 'voted_game';
                //  console.log(readFromLocalStorage(local_storage_key));
                if (!!readFromLocalStorage(local_storage_key)) {
                    var voted_game = readFromLocalStorage(local_storage_key);
                    let _voted = '';
                    if (voted_game.length > 0) {
                        $.each(voted_game, function (key, voted_game) {
                            if (voted_game.id == _game_id) {
                                _voted = voted_game.vote;

                                if (_voted === 'like') {
                                    voteUpBtn.addClass('voted');
                                    child_up_last.text("Remove");
                                    voteDownBtn.removeClass('voted');
                                } else if (_voted === 'dislike') {
                                    voteDownBtn.addClass('voted');
                                    child_down_last.text("Remove");
                                    voteUpBtn.removeClass('voted');
                                    console.log('dislike')
                                } else {

                                    voteUpBtn.removeClass('voted');
                                    voteDownBtn.removeClass('voted');
                                    child_down_last.text("Dislike");
                                    child_up_last.text("Like");
                                    console.log('not vote')
                                }
                            }
                        });
                    }
                } 
            })
            .fail(function (jqxhr, textStatus, error) {
                console.log("Request Failed: " + textStatus + ", " + error);
            });
        //


    }
}

function formatNumber(num) {
    // For numbers less than 1000, return the number as-is.
    if (num < 1000) {
        return num.toString();
    }

    // Define suffixes for thousands, millions, billions, and trillions.
    var suffixes = ["k", "M", "B", "T"];
    var suffixIndex = -1;
    var formattedNum = num;

    // Divide the number by 1000 until it is less than 1000, increasing the suffix index each time.
    while (formattedNum >= 1000 && suffixIndex < suffixes.length - 1) {
        formattedNum /= 1000;
        suffixIndex++;
    }

    // Format the number with one decimal place if it's less than 10, otherwise use no decimals.
    var precision = formattedNum < 10 ? 1 : 0;
    return formattedNum.toFixed(precision) + suffixes[suffixIndex];
}

/*=========Vote========*/

/*=========LocalStorage========*/
function saveToLocalStorage(key, value) {
    // Convert value to JSON string if it's not already a string
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
}

function readFromLocalStorage(key) {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
        // Key not found
        return [];
    }

    // Try to parse the stored string as JSON.
    // If parsing fails, return it as a string.
    try {
        return JSON.parse(storedValue);
    } catch (err) {
        return storedValue;
    }
}

function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}
