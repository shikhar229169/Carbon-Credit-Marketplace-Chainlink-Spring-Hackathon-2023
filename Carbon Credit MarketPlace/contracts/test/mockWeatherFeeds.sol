// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract mockWeatherFeeds {
    bytes public latestResponse;

    constructor (bytes memory response) {
        latestResponse = response;
    }

    function setResponse(bytes memory response) public {
        latestResponse = response;
    }
}