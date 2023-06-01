// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract mockEmissionFeeds {
    bytes public latestResponse;

    constructor (bytes memory response) {
        latestResponse = response;
    }

    function setResponse(bytes memory response) public {
        latestResponse = response;
    }
}