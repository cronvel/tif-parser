/*
	Tab Indented Parser
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/



// Load modules
var string = require( 'string-kit' ) ;



var tifParser = {} ;
module.exports = tifParser ;



tifParser.parse = function( str , options )
{
	if ( typeof str !== 'string' ) { throw new Error( "[tifParser] parse() need a string as argument #0" ) ; }
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var i , j , regexp , regexpString , commentMark , escCommentMark ,
		length , lines , matches , parent , previousDepth , depth , content , comment , node ,
		indent , blockContent , eaten = 1 , ancestors = [] ;
	
	lines = str.split( '\n' ) ;
	length = lines.length ;
	
	previousDepth = 0 ;
	
	ancestors[ 0 ] = {
		depth: 0 ,
		children: []
	} ;
	
	commentMark = options.commentMark || '#' ;
	escCommentMark = string.escape.regExpPattern( commentMark ) ;
	
	// Original regexp:
	// /^(\t*)(?:\s*)(?:> (.*)|((?:\\\\|\\#|.*?)*?)(?:\s*)(?:#\s*(.*?))?(?:\s*))$/
	regexpString = "^(\t*)(?:\\s*)(?:> (.*)|((?:\\\\\\\\|\\\\" + escCommentMark + "|.*?)*?)(?:\\s*)(?:" + escCommentMark + "\\s*(.*?))?(?:\\s*))$" ;
	regexp = new RegExp( regexpString ) ;
	
	for ( i = 0 ; i < length ; i += eaten )
	{
		eaten = 1 ;
		
		//matches = lines[ i ].match( /^(\t*)(?:\s*)(?:> (.*)|((?:\\\\|\\#|.*?)*?)(?:\s*)(?:#\s*(.*?))?(?:\s*))$/ ) ;
		matches = lines[ i ].match( regexp ) ;
		
		// If the regex do not match, then the file is fucked up (it should rarely happen)
		if ( matches === null ) { throw new Error( '[tifParser] Parse error on line ' + i + ': ' + lines[ i ] ) ; }
		
		// Check indentation error
		indent = matches[ 1 ] ;
		depth = indent.length + 1 ;
		if ( depth > previousDepth + 1 ) { throw new Error( "[tifParser] Indentation error - deeper than parent's depth + 1 on line " + i + ': ' + lines[ i ] ) ; }
		
		if ( ! matches[ 2 ] )
		{
			// Standard case
			
			content = matches[ 3 ] ;
			comment = options.removeComment ? undefined : matches[ 4 ] ;
			
			// Check if content is only garbage of non-printable characters
			if ( ! content || ! content.match( /\S/ ) ) { content = undefined ; }
			if ( ! comment || ! comment.match( /\S/ ) ) { comment = undefined ; }
			
			// Skip empty lines
			if ( ! content && ! comment ) { continue ; }
			
			if ( typeof content === 'string' )
			{
				content = tifParser.contentUnescape( content , commentMark , escCommentMark ) ;
			}
		}
		else
		{
			// Block of text case
			
			content = matches[ 2 ] ;
			
			// We are in a starting block of unformated text
			for ( j = i + 1 ; j < length ; j ++ )
			{
				matches = lines[ j ].match( new RegExp( '^' + indent + '(.*)$' ) ) ;
				
				if ( ! matches ) { break ; }
				blockContent = matches[ 1 ] ;
				
				// Check if content is only garbage of non-printable characters
				if ( ! blockContent || ! blockContent.match( /\S/ ) ) { break ; }
				
				content += '\n' + blockContent ;
				eaten ++ ;
			}
		}
		
		parent = ancestors[ depth - 1 ] ;
		
		node = {
			depth: depth ,
			line: i + 1,		// Most editors have '1' as the first line instead of 0
			content: content ,
			comment: comment ,
			children: []
		} ;
		
		parent.children.push( node ) ;
		
		// comment-only line do not update depth, and they cannot have children
		if ( content )
		{
			ancestors[ depth ] = node ;
			previousDepth = depth ;
		}
	}
	
	return ancestors[ 0 ] ;
} ;



tifParser.contentUnescape = function contentUnescape( content , commentMark , escCommentMark )
{
	//content = content.replace( /\\(\\|t|n|r|>|#)/g , function( matches ) {
	content = content.replace( new RegExp( "\\\\(\\\\|t|n|r|>|" + escCommentMark + ")" , 'g' ) , function( matches ) {
		
		switch ( matches[ 1 ] )
		{
			case '\\' :
				return '\\' ;
			case 't' :
				return '\t' ;
			case 'n' :
				return '\n' ;
			case 'r' :
				return '\r' ;
			case '>' :
				return '>' ;
			case commentMark :
				return commentMark ;
		}
	} ) ;
	
	return content ;
} ;


