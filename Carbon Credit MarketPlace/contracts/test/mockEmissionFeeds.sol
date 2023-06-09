// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract mockEmissionFeeds {
    bytes public latestResponse;

    constructor (bytes memory response) {
        latestResponse = response;
    }

    function _setResponse(bytes memory response) private {
        latestResponse = response;
    }

    function setResponse(int256 co, int256 no2, int256 so2, int256 pm2_5, int256 pm10) public {
        _setResponse(abi.encode(co, no2, so2, pm2_5, pm10));
    }
}