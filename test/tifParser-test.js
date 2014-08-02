/*
	The Cedric's Swiss Knife (CSK) - CSK Tab Indented Format Parser test suite
	
	The MIT License (MIT)
	
	Copyright (c) 2014 Cédric Ronvel 
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/* jshint unused:false */
/* global describe, it, before, after */


var tifParser = require( '../lib/tifParser.js' ) ;
var tree = require( 'tree-kit' ) ;
var expect = require( 'expect.js' ) ;
var fs = require( 'fs' ) ;





			/* Helper functions */



function fn()
{
}





			/* Tests */



describe( "Single line" , function() {
	
	it( "when empty, should return a root node without child" , function() {
		
		expect( tifParser.parse( '' ) ).to.eql( {
			depth: 0,
			children: []
		} ) ;
	} ) ;
	
	it( "with a single word, should return a root node with one child, no comment and the word as content" , function() {
		
		expect( tifParser.parse( 'Hello' ) ).to.eql( {
			depth: 0,
			children: [ {
				depth: 1,
				content: 'Hello',
				comment: undefined,
				children: []
			} ]
		} ) ;
	} ) ;
	
	it( "with a many words, should return a root node with one child, no comment and all words as content" , function() {
		
		expect( tifParser.parse( 'Hello world! How are you?' ) ).to.eql( {
			depth: 0,
			children: [ {
				depth: 1,
				content: 'Hello world! How are you?',
				comment: undefined,
				children: []
			} ]
		} ) ;
	} ) ;
	
	it( "with a comment, should return a root node with one child, no content and all words as comment" , function() {
		
		expect( tifParser.parse( '# This is a comment' ) ).to.eql( {
			depth: 0,
			children: [ {
				depth: 1,
				content: undefined,
				comment: 'This is a comment',
				children: []
			} ]
		} ) ;
	} ) ;
	
	it( "with content and comment, should return a root node with one child, having content and comment" , function() {
		
		expect( tifParser.parse( 'Hello world! # This is a comment' ) ).to.eql( {
			depth: 0,
			children: [ {
				depth: 1,
				content: 'Hello world!',
				comment: 'This is a comment',
				children: []
			} ]
		} ) ;
	} ) ;
	
	it( "should trim whitespace in both content and comment" , function() {
		
		expect( tifParser.parse( '  \t Hello world! \t   #   \t  This is a comment \t   ' ) ).to.eql( {
			depth: 0,
			children: [ {
				depth: 1,
				content: 'Hello world!',
				comment: 'This is a comment',
				children: []
			} ]
		} ) ;
	} ) ;
	
	it( "should thow error if the line is indented" , function() {
		
		try {
			tifParser.parse( '\tHello world!' ) ;
			expect().fail( 'An exception must have been thrown' ) ;
		}
		catch ( error ) {
			expect( error.message ).to.match( /Indentation error/ ) ;
		}
	} ) ;
} ) ;



describe( "Sample file" , function() {
	
	it( "#1 comparison" , function() {
		
		var parsed = tifParser.parse( fs.readFileSync( 'sample1.txt' ).toString() ) ;
		
		var expected = {
			depth: 0,
			children: [
				{
					depth: 1,
					content: undefined,
					comment: "Starting comment",
					children: []
				},
				{
					depth: 1,
					content: "Big One",
					comment: undefined,
					children: [
						{
							depth: 2,
							content: "medium1",
							comment: undefined,
							children: []
						},
						{
							depth: 2,
							content: "medium2",
							comment: undefined,
							children: [
								{
									depth: 3,
									content: undefined,
									comment: "Comment #1",
									children: []
								},
								{
									depth: 3,
									content: "little1",
									comment: undefined,
									children: []
								},
								{
									depth: 3,
									content: undefined,
									comment: "Comment #2",
									children: []
								},
								{
									depth: 3,
									content: "little2",
									comment: undefined,
									children: []
								}
							]
						},
						{
							depth: 2,
							content: "medium3",
							comment: "with a comment",
							children: [
								{
									depth: 3,
									content: undefined,
									comment: "Comment #3",
									children: []
								}
							]
						},
						{
							depth: 2,
							content: "medium4 with many words",
							comment: undefined,
							children: []
						},
						{
							depth: 2,
							content: "medium5 with many words",
							comment: "and a comment",
							children: []
						}
					]
				},
				{
					depth: 1,
					content: "Big2",
					comment: undefined,
					children: [
						{
							depth: 2,
							content: "not a \\#comment here",
							comment: undefined,
							children: []
						}
					]
				},
				{
					depth: 1,
					content: undefined,
					comment: "The next node is not a child of this comment",
					children: []
				}
			]
		} ;
		
		expect( tree.diff( parsed , expected ) ).to.equal( null ) ;
		expect( parsed ).to.eql( expected ) ;
		
	} ) ;
} ) ;



